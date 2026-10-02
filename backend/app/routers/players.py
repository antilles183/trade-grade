from fastapi import APIRouter, HTTPException

from app.models import Player
from app.services.players import get_players

router = APIRouter(prefix="/api/players", tags=["players"])


@router.get("", response_model=list[Player])
async def list_players() -> list[Player]:
    try:
        return await get_players()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to load players from ESPN: {e}") from e
