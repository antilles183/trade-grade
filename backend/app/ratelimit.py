from slowapi import Limiter
from slowapi.util import get_remote_address

# Keyed by client IP. uvicorn runs with --proxy-headers, so behind the reverse proxy (Traefik) this is the real client.
limiter = Limiter(key_func=get_remote_address)
