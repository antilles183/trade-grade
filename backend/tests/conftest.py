import os

# Settings has no defaults and is built at import time, so provide values before `app` is imported.
os.environ.setdefault("GEMINI_API_KEY", "test-key")
os.environ.setdefault("GEMINI_MODEL", "test-model")
os.environ.setdefault("NFL_SEASON", "2026")
os.environ.setdefault("CORS_ORIGINS", '["http://localhost:5173"]')
