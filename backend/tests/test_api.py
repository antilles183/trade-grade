import pytest
from fastapi.testclient import TestClient

from google.genai import errors

from app.main import app
from app.models import TradeAnalysis
from app.services import gemini, players

RAW = [
    {"id": 1, "fullName": "Star QB", "defaultPositionId": 1, "proTeamId": 12, "ownership": {"percentOwned": 99.0}},
    {"id": 2, "fullName": "Good RB", "defaultPositionId": 2, "proTeamId": 25, "ownership": {"percentOwned": 80.0}},
    {"id": 3, "fullName": "Deep WR", "defaultPositionId": 3, "proTeamId": 0},
    {"id": 4, "fullName": "Some LB", "defaultPositionId": 10, "proTeamId": 6},
    {"id": 5, "fullName": "Bills D/ST", "defaultPositionId": 16, "proTeamId": 2, "ownership": {"percentOwned": 50.0}},
]

ANALYSIS = TradeAnalysis(
    grade="B+",
    verdict="accept",
    summary="Good deal.",
    giving_analysis="Giving a RB.",
    receiving_analysis="Getting a QB.",
)


@pytest.fixture(autouse=True)
def mock_espn(monkeypatch):
    players._cache.update(players=None, fetched_at=0.0)
    monkeypatch.setattr(players, "_fetch_raw", lambda: RAW)


@pytest.fixture
def client():
    return TestClient(app)


def test_normalize_filters_and_sorts():
    result = players.normalize_players(RAW)
    assert [p.id for p in result] == [1, 2, 5, 3]
    assert result[0].position == "QB" and result[0].pro_team == "KC"
    assert result[2].position == "D/ST"
    assert result[3].pro_team == "FA"


def test_list_players(client):
    resp = client.get("/api/players")
    assert resp.status_code == 200
    assert len(resp.json()) == 4


@pytest.mark.parametrize(
    "body",
    [
        {"giving": [], "receiving": [1]},
        {"giving": [1], "receiving": []},
        {"giving": [1], "receiving": [1, 2]},
    ],
)
def test_analyze_validation(client, body):
    assert client.post("/api/trades/analyze", json=body).status_code == 422


def test_analyze_unknown_ids(client):
    resp = client.post("/api/trades/analyze", json={"giving": [1], "receiving": [999]})
    assert resp.status_code == 422
    assert "999" in resp.json()["detail"]


def test_analyze_success(client, monkeypatch):
    captured = {}

    async def fake_analyze(prompt):
        captured["prompt"] = prompt
        return ANALYSIS

    monkeypatch.setattr(gemini, "analyze_trade", fake_analyze)
    resp = client.post(
        "/api/trades/analyze",
        json={"giving": [2], "receiving": [1], "my_roster": [3]},
    )
    assert resp.status_code == 200
    assert resp.json()["grade"] == "B+"
    assert "Players I GIVE:\n- Good RB (RB, SF)" in captured["prompt"]
    assert "My current roster" in captured["prompt"]
    assert "Trade partner" not in captured["prompt"]


def test_analyze_gemini_error(client, monkeypatch):
    async def boom(prompt):
        raise gemini.GeminiError("Gemini request timed out.")

    monkeypatch.setattr(gemini, "analyze_trade", boom)
    resp = client.post("/api/trades/analyze", json={"giving": [2], "receiving": [1]})
    assert resp.status_code == 502
    assert resp.json()["detail"] == "Gemini request timed out."


class _FakeModels:
    def __init__(self, exc):
        self.exc = exc

    async def generate_content(self, **kwargs):
        raise self.exc


def _patch_gemini_failure(monkeypatch, exc):
    class FakeClient:
        def __init__(self, **kwargs):
            self.aio = type("Aio", (), {"models": _FakeModels(exc)})()

    monkeypatch.setattr(gemini.genai, "Client", FakeClient)
    monkeypatch.setattr(gemini.settings, "gemini_api_key", "test-key")


def test_analyze_gemini_api_error_shows_only_message(client, monkeypatch):
    exc = errors.ServerError(
        503, {"error": {"code": 503, "message": "High demand.", "status": "UNAVAILABLE"}}
    )
    _patch_gemini_failure(monkeypatch, exc)
    resp = client.post("/api/trades/analyze", json={"giving": [2], "receiving": [1]})
    assert resp.status_code == 503
    assert resp.headers["retry-after"] == "5"
    assert resp.json()["detail"] == "High demand."


def test_analyze_non_503_api_error_is_502(client, monkeypatch):
    exc = errors.ClientError(
        404, {"error": {"code": 404, "message": "Model not found.", "status": "NOT_FOUND"}}
    )
    _patch_gemini_failure(monkeypatch, exc)
    resp = client.post("/api/trades/analyze", json={"giving": [2], "receiving": [1]})
    assert resp.status_code == 502
    assert resp.json()["detail"] == "Model not found."


def test_analyze_unexpected_error_is_generic(client, monkeypatch):
    _patch_gemini_failure(monkeypatch, RuntimeError("secret internals"))
    resp = client.post("/api/trades/analyze", json={"giving": [2], "receiving": [1]})
    assert resp.status_code == 502
    assert resp.json()["detail"] == "Gemini request failed. Please try again."
