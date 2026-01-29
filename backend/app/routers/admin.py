from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, Payment, Event, UserRole, PaymentStatus, ContactMessage
from app.schemas import (
    UserAdminResponse,
    PaymentResponse,
    DashboardStats,
    UserUpdate,
    ContactMessageResponse
)
from app.dependencies import get_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas del dashboard (solo admin).
    """
    total_users = db.query(func.count(User.id)).scalar()
    total_payments = db.query(func.count(Payment.id)).scalar()
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.COMPLETED.value
    ).scalar() or 0.0
    pending_payments = db.query(func.count(Payment.id)).filter(
        Payment.status == PaymentStatus.PENDING.value
    ).scalar()
    completed_payments = db.query(func.count(Payment.id)).filter(
        Payment.status == PaymentStatus.COMPLETED.value
    ).scalar()
    total_events = db.query(func.count(Event.id)).scalar()
    active_events = db.query(func.count(Event.id)).filter(
        Event.is_active == True
    ).scalar()
    
    return {
        "total_users": total_users,
        "total_payments": total_payments,
        "total_revenue": total_revenue,
        "pending_payments": pending_payments,
        "completed_payments": completed_payments,
        "total_events": total_events,
        "active_events": active_events
    }


@router.get("/users", response_model=list[UserAdminResponse])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Listar todos los usuarios (solo admin).
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/users/{user_id}", response_model=UserAdminResponse)
def get_user(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Obtener detalles de un usuario específico (solo admin).
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.patch("/users/{user_id}", response_model=UserAdminResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Actualizar datos de un usuario (solo admin).
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return user


@router.patch("/users/{user_id}/toggle-role", response_model=UserAdminResponse)
def toggle_user_role(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Cambiar rol de usuario entre USER y ADMIN (solo admin).
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own role"
        )
    
    # Cambiar rol
    user.role = UserRole.USER.value if user.is_admin() else UserRole.ADMIN.value
    
    db.commit()
    db.refresh(user)
    
    return user


@router.patch("/users/{user_id}/toggle-active", response_model=UserAdminResponse)
def toggle_user_active(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Activar/desactivar usuario (solo admin).
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate yourself"
        )
    
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Eliminar usuario (solo admin).
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    db.delete(user)
    db.commit()


@router.get("/messages", response_model=list[ContactMessageResponse])
def list_messages(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Listar mensajes de contacto (solo admin).
    """
    messages = (
        db.query(ContactMessage)
        .order_by(ContactMessage.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return messages


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(
    message_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Eliminar mensaje de contacto (solo admin).
    """
    message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )

    db.delete(message)
    db.commit()
