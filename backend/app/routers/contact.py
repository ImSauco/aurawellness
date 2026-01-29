from email.message import EmailMessage
import logging
import smtplib
import ssl

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.schemas import ContactMessage, ContactResponse
from app.models import ContactMessage as ContactMessageModel

router = APIRouter(prefix="/contact", tags=["contact"])
logger = logging.getLogger("contact")


def send_contact_email(payload: ContactMessage) -> None:
    if not settings.SMTP_HOST or not settings.SMTP_FROM or not settings.SMTP_TO:
        raise RuntimeError("SMTP no configurado")

    msg = EmailMessage()
    msg["Subject"] = payload.subject or "Nuevo mensaje desde la web By Aura"
    msg["From"] = settings.SMTP_FROM or settings.SMTP_USER
    msg["To"] = settings.SMTP_TO
    msg["Reply-To"] = payload.email

    body = (
        f"Nombre: {payload.name}\n"
        f"Email: {payload.email}\n"
        f"Origen: {payload.source or 'web'}\n\n"
        f"Mensaje:\n{payload.message}\n"
    )
    msg.set_content(body)

    context = ssl.create_default_context()

    if settings.SMTP_USE_SSL:
        server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context)
    else:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.ehlo()
        if settings.SMTP_USE_TLS:
            server.starttls(context=context)
            server.ehlo()

    try:
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
    finally:
        server.quit()


@router.post("/", response_model=ContactResponse)
def contact(payload: ContactMessage, db: Session = Depends(get_db)):
    try:
        message_record = ContactMessageModel(
            name=payload.name,
            email=payload.email,
            message=payload.message,
            subject=payload.subject,
            source=payload.source,
        )
        db.add(message_record)
        db.commit()
        db.refresh(message_record)

        send_contact_email(payload)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Error enviando correo de contacto")
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return ContactResponse()
