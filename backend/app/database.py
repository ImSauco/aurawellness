from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Crear engine de base de datos
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,  # Cambiar a True para ver queries SQL
    pool_pre_ping=True,  # Verificar conexión antes de usar
)

# Session local para queries
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()


def get_db():
    """Dependency para inyectar sesión BD en endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
