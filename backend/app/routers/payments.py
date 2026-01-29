from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, Payment, PaymentStatus
from app.schemas import PaymentCreate, PaymentResponse, PaymentListResponse, PaymentUpdate, PaymentStats
from app.dependencies import get_admin_user, get_current_user

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crear nuevo pago.
    Cualquier usuario autenticado puede hacerlo.
    """
    # Verificar que el usuario destino existe
    user = db.query(User).filter(User.id == payment_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Crear pago
    new_payment = Payment(
        user_id=payment_data.user_id,
        amount=payment_data.amount,
        description=payment_data.description,
        payment_method=payment_data.payment_method,
        status=PaymentStatus.PENDING.value
    )
    
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    
    return new_payment


@router.get("/", response_model=list[PaymentListResponse])
def list_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status_filter: str = Query(None),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Listar todos los pagos (solo admin).
    Soporta paginación y filtro por estado.
    """
    query = db.query(Payment).offset(skip).limit(limit)
    
    if status_filter:
        query = query.filter(Payment.status == status_filter)
    
    payments = query.all()
    
    return payments


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Obtener detalles de un pago específico (solo admin).
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return payment


@router.patch("/{payment_id}", response_model=PaymentResponse)
def update_payment(
    payment_id: int,
    payment_data: PaymentUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Actualizar estado de un pago (solo admin).
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Actualizar campos
    payment.status = payment_data.status
    if payment_data.description:
        payment.description = payment_data.description
    
    db.commit()
    db.refresh(payment)
    
    return payment


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(
    payment_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Eliminar un pago (solo admin).
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    db.delete(payment)
    db.commit()


@router.get("/stats/summary", response_model=PaymentStats)
def get_payment_stats(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas de pagos (solo admin).
    """
    total_amount = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.COMPLETED.value
    ).scalar() or 0.0
    
    completed = db.query(func.count(Payment.id)).filter(
        Payment.status == PaymentStatus.COMPLETED.value
    ).scalar()
    
    pending = db.query(func.count(Payment.id)).filter(
        Payment.status == PaymentStatus.PENDING.value
    ).scalar()
    
    failed = db.query(func.count(Payment.id)).filter(
        Payment.status == PaymentStatus.FAILED.value
    ).scalar()
    
    refunded = db.query(func.count(Payment.id)).filter(
        Payment.status == PaymentStatus.REFUNDED.value
    ).scalar()
    
    return {
        "total_amount": total_amount,
        "completed_count": completed,
        "pending_count": pending,
        "failed_count": failed,
        "refunded_count": refunded
    }
