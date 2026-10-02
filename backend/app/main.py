from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import players, trades

app = FastAPI(title="Trade Grade API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(players.router)
app.include_router(trades.router)


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
