import logging

from fastapi import APIRouter, HTTPException

from app.models import Player
from app.services.players import get_players

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/players", tags=["players"])


@router.get("", response_model=list[Player])
async def list_players() -> list[Player]:
    try:
        return await get_players()
    except Exception as e:
        logger.exception("Failed to load players from ESPN")
        raise HTTPException(status_code=502, detail="Failed to load players from ESPN") from e
