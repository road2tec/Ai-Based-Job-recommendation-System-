import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = "jobify"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey_for_jwt_auth_jobify_12345")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@jobify.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    YOUTUBE_API_KEY: str = os.getenv("YOUTUBE_API_KEY", "")

settings = Settings()
# Trigger reload to load new env settings v2
