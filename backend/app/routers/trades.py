import logging

from fastapi import APIRouter, HTTPException, Request

from app.models import TradeAnalysis, TradeRequest
from app.ratelimit import limiter
from app.services import gemini
from app.services.players import get_players_by_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/trades", tags=["trades"])


@router.post("/analyze", response_model=TradeAnalysis)
@limiter.limit("10/minute")
async def analyze(request: Request, req: TradeRequest) -> TradeAnalysis:
    try:
        by_id = await get_players_by_id()
    except Exception as e:
        logger.exception("Failed to load players from ESPN")
        raise HTTPException(status_code=502, detail="Failed to load players from ESPN") from e

    all_ids = req.giving + req.receiving + req.my_roster + req.their_roster
    unknown = sorted({pid for pid in all_ids if pid not in by_id})
    if unknown:
        raise HTTPException(status_code=422, detail=f"Unknown player ids: {unknown}")

    def resolve(ids: list[int]):
        return [by_id[pid] for pid in dict.fromkeys(ids)]

    prompt = gemini.build_prompt(
        resolve(req.giving),
        resolve(req.receiving),
        resolve(req.my_roster),
        resolve(req.their_roster),
        req.league_format,
    )
    try:
        return await gemini.analyze_trade(prompt)
    except gemini.GeminiBusyError as e:
        raise HTTPException(status_code=503, detail=str(e), headers={"Retry-After": "5"}) from e
    except gemini.GeminiError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
