FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:0.12.23 /uv /usr/local/bin/uv

ENV PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Dependencies first so this layer is cached until the lockfile changes.
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY app ./app

RUN useradd --system --no-create-home appuser
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
