from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.database import Base, engine
from app.models import User, Payment, Event, Product, WebContent
from app.routers import auth, payments, events, admin, products, content, contact

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Asegurar columnas nuevas sin migraciones (PostgreSQL)
try:
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0"))
except Exception:
    pass

# Crear aplicación FastAPI
BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="By Aura Backend API",
    description="API para gestión de pagos y eventos de By Aura",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost",
        "https://byaurawell.com",
        "https://www.byaurawell.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Archivos estáticos (uploads)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Incluir routers
app.include_router(auth.router)
app.include_router(payments.router)
app.include_router(events.router)
app.include_router(admin.router)
app.include_router(products.router)
app.include_router(content.router)
app.include_router(contact.router)


@app.get("/")
def read_root():
    """Endpoint raíz de la API"""
    return {
        "message": "By Aura API",
        "docs": "/docs",
        "health": "ok"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
