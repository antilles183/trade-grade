from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    gemini_api_key: str
    gemini_model: str
    gemini_timeout_seconds: float = 60.0
    nfl_season: int
    players_cache_ttl_seconds: int = 12 * 60 * 60
    cors_origins: list[str]


settings = Settings()  # pyright: ignore[reportCallIssue]
