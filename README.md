# Trade Grade

Fantasy football trade analyzer. Search NFL players, build a trade offer (optionally with both rosters), and get a Gemini-generated grade and verdict.

- **Frontend:** React, Vite, TanStack Query (`frontend/`)
- **Backend:** FastAPI, `espn-api` for the player list, Google Gemini for analysis (`backend/`)
- No ESPN league access and no storage: the app is stateless.

## Setup

Backend (Python 3.12+, [uv](https://docs.astral.sh/uv/)):

```bash
cd backend
uv sync
cp .env.example .env   # set GEMINI_API_KEY
uv run uvicorn app.main:app --reload
uv run pytest
```

Frontend (Node 22+):

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173, proxies /api to :8000
```

## API

- `GET /api/players`: all fantasy-relevant players (QB/RB/WR/TE/K/D/ST), cached 12h, sorted by ownership.
- `POST /api/trades/analyze`: `{giving: [ids], receiving: [ids], my_roster?: [ids], their_roster?: [ids], league_format?: string}` returns grade, verdict, and reasoning.
