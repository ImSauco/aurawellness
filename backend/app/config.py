from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Base de datos
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/byaura_db"
    
    # JWT
    SECRET_KEY: str = "tu-clave-secreta-cambiar-en-produccion"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Admin
    DEFAULT_ADMIN_EMAIL: str = "admin@byaura.com"
    DEFAULT_ADMIN_PASSWORD: str = "AdminPassword123!"

    # SMTP (Contacto)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""
    SMTP_TO: str = ""
    SMTP_USE_TLS: bool = True
    SMTP_USE_SSL: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
