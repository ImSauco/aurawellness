from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import WebContent, User
from app.schemas import WebContentResponse, WebContentUpdate
from app.dependencies import get_admin_user

router = APIRouter(prefix="/content", tags=["content"])


def get_or_create_content(db: Session) -> WebContent:
    content = db.query(WebContent).first()
    if content:
        return content

    content = WebContent(
        events_title="ÚLTIMOS EVENTOS",
        events_body="",
        events_cta_text="Ver todos los eventos",
        events_cta_link="eventos.html",
        shop_title="BY AURA COLLECTION",
        shop_hero_image=""
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@router.get("/public", response_model=WebContentResponse)
def get_public_content(db: Session = Depends(get_db)):
    return get_or_create_content(db)


@router.get("/", response_model=WebContentResponse)
def get_admin_content(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    return get_or_create_content(db)


@router.patch("/", response_model=WebContentResponse)
def update_content(
    content_data: WebContentUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    content = get_or_create_content(db)
    for key, value in content_data.model_dump(exclude_unset=True).items():
        setattr(content, key, value)

    db.commit()
    db.refresh(content)
    return content