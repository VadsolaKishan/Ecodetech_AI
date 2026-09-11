import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import List, Union
import json
from pydantic import field_validator

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "EcoDetect AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "carboncopilot_hackout26_secure_key_ai_copilot_998877")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./carboncopilot.db")
    DB_SSLMODE: str = os.getenv("DB_SSLMODE", "")
    
    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v_str = v.strip()
            if v_str.startswith("[") and v_str.endswith("]"):
                try:
                    return json.loads(v_str)
                except Exception:
                    pass
            return [origin.strip() for origin in v_str.split(",") if origin.strip()]
        return v
    
    # AI / LLM Configuration (Google Gemini)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("LLM_API_KEY", ""))
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")
    MAPS_API_KEY: str = os.getenv("MAPS_API_KEY", "")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")

    class Config:
        case_sensitive = True

settings = Settings()
