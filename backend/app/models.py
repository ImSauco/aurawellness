from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Table, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


# Tabla asociativa para Many-to-Many: Usuarios y Eventos
user_event_association = Table(
    'user_event_association',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE')),
    Column('event_id', Integer, ForeignKey('events.id', ondelete='CASCADE'))
)


class UserRole(str, enum.Enum):
    """Roles de usuario"""
    ADMIN = "admin"
    USER = "user"


class PaymentStatus(str, enum.Enum):
    """Estados de pago"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class User(Base):
    """Modelo de Usuario"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.USER.value, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")
    events = relationship("Event", secondary=user_event_association, back_populates="participants")
    
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN.value


class Payment(Base):
    """Modelo de Pago"""
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(20), default=PaymentStatus.PENDING.value, nullable=False)
    description = Column(String(500), nullable=True)
    payment_method = Column(String(50), nullable=True)  # card, bank_transfer, etc.
    transaction_id = Column(String(255), unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    user = relationship("User", back_populates="payments")


class Event(Base):
    """Modelo de Evento"""
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    date_start = Column(DateTime, nullable=False)
    date_end = Column(DateTime, nullable=True)
    location = Column(String(500), nullable=True)
    capacity = Column(Integer, default=100, nullable=False)
    price = Column(Float, default=0.0, nullable=False)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    participants = relationship("User", secondary=user_event_association, back_populates="events")
    
    @property
    def participants_count(self) -> int:
        return len(self.participants)
    
    @property
    def available_spots(self) -> int:
        return max(0, self.capacity - self.participants_count)


class Product(Base):
    """Modelo de Producto (stock tienda)"""
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    price = Column(Float, default=0.0, nullable=False)
    stock = Column(Integer, default=0, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class WebContent(Base):
    """Contenido editable de la web"""
    __tablename__ = "web_content"

    id = Column(Integer, primary_key=True, index=True)
    events_title = Column(String(255), nullable=True)
    events_body = Column(Text, nullable=True)
    events_cta_text = Column(String(255), nullable=True)
    events_cta_link = Column(String(500), nullable=True)
    shop_title = Column(String(255), nullable=True)
    shop_hero_image = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ContactMessage(Base):
    """Mensajes enviados desde formularios de contacto"""
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    subject = Column(String(200), nullable=True)
    source = Column(String(200), nullable=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
