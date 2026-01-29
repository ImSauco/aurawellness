from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models import UserRole, PaymentStatus


# ===== USUARIO =====
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserPasswordChange(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8)


class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserAdminResponse(UserResponse):
    """Respuesta con información sensible (solo para admin)"""
    pass


# ===== AUTENTICACIÓN =====
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    sub: str  # email
    exp: Optional[datetime] = None


# ===== PAGO =====
class PaymentBase(BaseModel):
    amount: float = Field(..., gt=0)
    description: Optional[str] = None
    payment_method: Optional[str] = None


class PaymentCreate(PaymentBase):
    user_id: int


class PaymentUpdate(BaseModel):
    status: PaymentStatus
    description: Optional[str] = None


class PaymentResponse(PaymentBase):
    id: int
    user_id: int
    status: str
    transaction_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PaymentListResponse(BaseModel):
    """Respuesta para listar pagos con info del usuario"""
    id: int
    user: UserResponse
    amount: float
    status: str
    created_at: datetime


# ===== PRODUCTO =====
class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    sku: str = Field(..., min_length=2, max_length=100)
    price: float = Field(default=0.0, ge=0)
    stock: int = Field(default=0, ge=0)
    sort_order: int = Field(default=0, ge=0)
    image_url: Optional[str] = None
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== CONTENIDO WEB =====
class WebContentBase(BaseModel):
    events_title: Optional[str] = None
    events_body: Optional[str] = None
    events_cta_text: Optional[str] = None
    events_cta_link: Optional[str] = None
    shop_title: Optional[str] = None
    shop_hero_image: Optional[str] = None


class WebContentUpdate(WebContentBase):
    pass


class WebContentResponse(WebContentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== CONTACTO =====
class ContactMessage(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(..., min_length=1, max_length=100, alias="nombre")
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=5000, alias="mensaje")
    subject: Optional[str] = Field(default="Nuevo mensaje desde la web By Aura", max_length=200)
    source: Optional[str] = Field(default=None, max_length=200)


class ContactResponse(BaseModel):
    status: str = "ok"


class ContactMessageResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    message: str
    subject: Optional[str] = None
    source: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ===== EVENTO =====
class EventBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    date_start: datetime
    date_end: Optional[datetime] = None
    location: Optional[str] = None
    capacity: int = Field(default=100, ge=1)
    price: float = Field(default=0.0, ge=0)
    image_url: Optional[str] = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date_start: Optional[datetime] = None
    date_end: Optional[datetime] = None
    location: Optional[str] = None
    capacity: Optional[int] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class EventResponse(EventBase):
    id: int
    is_active: bool
    participants_count: int
    available_spots: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class EventDetailResponse(EventResponse):
    """Evento con lista de participantes"""
    participants: List[UserResponse] = []


# ===== DASHBOARD ADMIN =====
class DashboardStats(BaseModel):
    """Estadísticas para dashboard admin"""
    total_users: int
    total_payments: int
    total_revenue: float
    pending_payments: int
    completed_payments: int
    total_events: int
    active_events: int


class PaymentStats(BaseModel):
    """Estadísticas de pagos"""
    total_amount: float
    completed_count: int
    pending_count: int
    failed_count: int
    refunded_count: int
