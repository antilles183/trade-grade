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

## Docker (backend)

See [Deployment](#deployment). The compose file (`backend/docker-compose.yaml`) is meant for Coolify and does not publish port 8000; to run the image directly for local testing: `docker build -t trade-grade-backend backend && docker run --rm -p 8000:8000 --env-file backend/.env trade-grade-backend`. Secrets come from `backend/.env` at runtime and are not baked into the image.

## Deployment

**Backend (self-hosted on Coolify, which provides the Traefik reverse proxy and TLS):**

1. Point a DNS record (e.g. `api.example.com`) at the Coolify server.
2. In Coolify, create a **Docker Compose** resource from this repo with base directory `backend` (compose file `docker-compose.yaml`).
3. Set the domain for the `backend` service to `https://api.example.com:8000` (the `:8000` is the container port).
4. Add the environment variables below in Coolify and deploy.

| Variable | Required | Notes |
|---|---|---|
| `GEMINI_API_KEY` | yes | The app refuses to start without it. Set a spend cap on the key. |
| `GEMINI_MODEL` | yes | e.g. `gemini-3.5-flash-lite` |
| `NFL_SEASON` | yes | e.g. `2026` |
| `CORS_ORIGINS` | yes | JSON list of the frontend origin(s), e.g. `["https://your-site.vercel.app"]`. The Vercel rewrite avoids CORS, but the app won't start without a valid value. |

`POST /api/trades/analyze` is limited to 10 requests/minute per IP, and `/docs` is disabled.

**Frontend (Vercel):**

1. Import the repo with **Root Directory** `frontend` (Vite is auto-detected).
2. Edit `frontend/vercel.json` and replace `api.example.com` with the backend's Coolify domain. Requests to `/api/*` are rewritten to the backend, so the browser stays same-origin and no CORS setup is needed.

## API

- `GET /api/players`: all fantasy-relevant players (QB/RB/WR/TE/K/D/ST), cached 12h, sorted by ownership.
- `POST /api/trades/analyze`: `{giving: [ids], receiving: [ids], my_roster?: [ids], their_roster?: [ids], league_format?: string}` returns grade, verdict, and reasoning.
