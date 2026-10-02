from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.5-flash-lite"
    gemini_timeout_seconds: float = 60.0
    nfl_season: int = 2026
    players_cache_ttl_seconds: int = 12 * 60 * 60
    cors_origins: list[str] = ["http://localhost:5173"]


settings = Settings()
