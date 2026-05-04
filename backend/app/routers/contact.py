"""Contact router — public form submit and admin view/read."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_admin
from app.models.contact import ContactMessage
from app.models.user import User
from app.schemas.contact import ContactMessageCreate, ContactMessageResponse
from app.services.crud_service import get_all, create_record, mark_message_read
from app.utils.email import send_email, build_contact_notification_html
from app.config import settings

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("", response_model=ContactMessageResponse, status_code=201)
async def submit_contact(
    data: ContactMessageCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Submit a contact form message."""
    msg = await create_record(db, ContactMessage, data.model_dump())

    # Send notification email to Milan in the background
    if settings.SMTP_USER:
        html = build_contact_notification_html(data.name, data.email, data.subject or "", data.message)
        background_tasks.add_task(
            send_email, settings.ADMIN_EMAIL, f"New Contact: {data.subject or 'No Subject'}", html
        )

    return ContactMessageResponse.model_validate(msg, from_attributes=True)


@router.get("/messages", response_model=List[ContactMessageResponse])
async def list_messages(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Get all contact messages (admin only)."""
    items = await get_all(db, ContactMessage, order_by=ContactMessage.created_at.desc())
    return [ContactMessageResponse.model_validate(i, from_attributes=True) for i in items]


@router.put("/messages/{msg_id}/read", response_model=ContactMessageResponse)
async def mark_read(
    msg_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Mark a message as read (admin only)."""
    msg = await mark_message_read(db, msg_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    return ContactMessageResponse.model_validate(msg, from_attributes=True)
