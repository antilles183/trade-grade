import time
from typing import Any

from espn_api.football.constant import PRO_TEAM_MAP
from espn_api.requests.espn_requests import EspnFantasyRequests
from fastapi.concurrency import run_in_threadpool

from app.config import settings
from app.models import Player

# ESPN's player `defaultPositionId` (distinct from the lineup-slot ids in POSITION_MAP).
DEFAULT_POSITION_MAP = {1: "QB", 2: "RB", 3: "WR", 4: "TE", 5: "K", 16: "D/ST"}

_cache: dict[str, Any] = {"players": None, "fetched_at": 0.0}


def _pro_team(team_id: int | None) -> str:
    abbrev = PRO_TEAM_MAP.get(team_id)
    return "FA" if abbrev in (None, "None") else abbrev


def normalize_players(raw: list[dict]) -> list[Player]:
    players = []
    for p in raw:
        position = DEFAULT_POSITION_MAP.get(p.get("defaultPositionId"))
        if position is None:
            continue
        players.append(
            Player(
                id=p["id"],
                name=p["fullName"],
                position=position,
                pro_team=_pro_team(p.get("proTeamId")),
                percent_owned=round((p.get("ownership") or {}).get("percentOwned", 0.0), 2),
            )
        )
    players.sort(key=lambda pl: pl.percent_owned, reverse=True)
    return players


def _fetch_raw() -> list[dict]:
    return EspnFantasyRequests(sport="nfl", year=settings.nfl_season, league_id=0).get_pro_players()


async def get_players() -> list[Player]:
    expired = time.monotonic() - _cache["fetched_at"] > settings.players_cache_ttl_seconds
    if _cache["players"] is None or expired:
        _cache["players"] = normalize_players(await run_in_threadpool(_fetch_raw))
        _cache["fetched_at"] = time.monotonic()
    return _cache["players"]


async def get_players_by_id() -> dict[int, Player]:
    return {p.id: p for p in await get_players()}
