# Trade Grade

Fantasy football trade analyzer. Search NFL players, build a trade offer (optionally with both rosters), and get a Gemini-generated grade and verdict.

- **Frontend:** React, Vite, TanStack Query (`frontend/`)
- **Backend:** FastAPI, `espn-api` for the player list, Google Gemini for analysis (`backend/`)
- No ESPN league access and no storage: the app is stateless.

## Running Locally

Backend (Python 3.12+, [uv](https://docs.astral.sh/uv/)):

```bash
cd backend
uv sync
cp .env.example .env   # set GEMINI_API_KEY
uv run uvicorn app.main:app --reload
uv run pytest
```
Or with Docker:

The compose file (`backend/docker-compose.yaml`) is meant for deployment and does not publish port 8000; to run the image directly for local testing:

```bash
docker build -t trade-grade-backend backend && docker run --rm -p 8000:8000 --env-file backend/.env trade-grade-backend
```
Secrets come from `backend/.env` at runtime and are not baked into the image.

Note: FastAPI docs are disabled

Frontend (Node 22+):

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173, proxies /api to :8000
```


## API

- `GET /api/players`: all fantasy-relevant players (QB/RB/WR/TE/K/D/ST), cached 12h, sorted by ownership.
- `POST /api/trades/analyze`: `{giving: [ids], receiving: [ids], my_roster?: [ids], their_roster?: [ids], league_format?: string}` returns grade, verdict, and reasoning.
