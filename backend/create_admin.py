from app.database import SessionLocal
from app.models import User, UserRole
from app.auth import AuthService
from app.config import settings


def create_admin():
    db = SessionLocal()
    try:
        admin_email = settings.DEFAULT_ADMIN_EMAIL
        admin_password = settings.DEFAULT_ADMIN_PASSWORD
        existing = db.query(User).filter(User.email == admin_email).first()
        if existing:
            print(f"El usuario admin '{admin_email}' ya existe.")
            return
        hashed_password = AuthService.hash_password(admin_password)
        admin = User(
            email=admin_email,
            full_name="Administrador By Aura",
            hashed_password=hashed_password,
            role=UserRole.ADMIN.value,
            is_active=True
        )
        db.add(admin)
        db.commit()
        print(f"Usuario admin '{admin_email}' creado correctamente.")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
