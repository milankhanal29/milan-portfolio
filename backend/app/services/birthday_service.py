"""Birthday event service with RSVP transactional logic."""

import uuid
from datetime import date, datetime, timezone
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.birthday import BirthdayEvent, MenuItem, RSVP, RSVPMenuSelection
from app.schemas.birthday import RSVPCreate


async def get_active_event(db: AsyncSession) -> Optional[BirthdayEvent]:
    """Get the currently active birthday event."""
    result = await db.execute(
        select(BirthdayEvent).where(BirthdayEvent.is_active == True).limit(1)
    )
    return result.scalar_one_or_none()


async def get_countdown_data(event: BirthdayEvent) -> dict:
    """Calculate countdown seconds and current age."""
    now = datetime.now(timezone.utc)
    birthday_this_year = datetime(
        now.year, event.birthday_date.month, event.birthday_date.day, tzinfo=timezone.utc
    )

    if birthday_this_year < now:
        # Birthday has passed this year, countdown to next year
        target = datetime(
            now.year + 1, event.birthday_date.month, event.birthday_date.day, tzinfo=timezone.utc
        )
    else:
        target = birthday_this_year

    countdown_seconds = int((target - now).total_seconds())

    # Calculate age
    today = date.today()
    age = today.year - event.birthday_date.year
    if (today.month, today.day) < (event.birthday_date.month, event.birthday_date.day):
        age -= 1

    return {"countdown_seconds": countdown_seconds, "age": age}


async def get_available_menu_items(db: AsyncSession) -> dict:
    """Get all available menu items grouped by category."""
    result = await db.execute(
        select(MenuItem)
        .where(MenuItem.is_available == True)
        .order_by(MenuItem.order, MenuItem.name)
    )
    items = result.scalars().all()

    grouped = {"food": [], "drink": []}
    for item in items:
        category = item.category.lower()
        if category not in grouped:
            grouped[category] = []
        grouped[category].append(item)

    return grouped


async def create_rsvp(db: AsyncSession, data: RSVPCreate) -> RSVP:
    """Create an RSVP with menu selections in a single transaction."""
    rsvp = RSVP(
        id=uuid.uuid4(),
        event_id=uuid.UUID(data.event_id),
        guest_name=data.guest_name,
        guest_email=data.guest_email,
        party_type=data.party_type,
        table_guests=data.table_guests,
        special_note=data.special_note,
    )
    db.add(rsvp)
    await db.flush()  # Get rsvp.id without committing

    # Add menu selections
    for selection in data.menu_selections:
        menu_selection = RSVPMenuSelection(
            id=uuid.uuid4(),
            rsvp_id=rsvp.id,
            menu_item_id=uuid.UUID(selection.menu_item_id),
            quantity=selection.quantity,
        )
        db.add(menu_selection)

    await db.commit()

    # Reload with relationships
    result = await db.execute(
        select(RSVP)
        .options(selectinload(RSVP.menu_selections).selectinload(RSVPMenuSelection.menu_item))
        .where(RSVP.id == rsvp.id)
    )
    return result.scalar_one()


async def get_all_rsvps(db: AsyncSession, event_id: Optional[str] = None) -> List[RSVP]:
    """Get all RSVPs with menu selections (admin)."""
    stmt = (
        select(RSVP)
        .options(selectinload(RSVP.menu_selections).selectinload(RSVPMenuSelection.menu_item))
        .order_by(RSVP.created_at.desc())
    )
    if event_id:
        stmt = stmt.where(RSVP.event_id == uuid.UUID(event_id))
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_wishes(db: AsyncSession, event_id: Optional[str] = None) -> List[RSVP]:
    """Get public wish data (name and note only)."""
    stmt = select(RSVP).order_by(RSVP.created_at.desc())
    if event_id:
        stmt = stmt.where(RSVP.event_id == uuid.UUID(event_id))
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_admin_stats(db: AsyncSession) -> dict:
    """Get dashboard statistics."""
    from app.models.blog import BlogPost
    from app.models.contact import ContactMessage

    # Total views
    blog_result = await db.execute(select(BlogPost))
    blogs = blog_result.scalars().all()
    total_views = sum(b.views for b in blogs)

    # RSVP count
    rsvp_result = await db.execute(select(RSVP))
    rsvps = rsvp_result.scalars().all()

    # Unread messages
    msg_result = await db.execute(
        select(ContactMessage).where(ContactMessage.is_read == False)
    )
    unread_messages = len(msg_result.scalars().all())

    # Active event
    active_event = await get_active_event(db)

    return {
        "total_blog_views": total_views,
        "total_blog_posts": len(blogs),
        "published_posts": len([b for b in blogs if b.is_published]),
        "total_rsvps": len(rsvps),
        "room_party_rsvps": len([r for r in rsvps if r.party_type == "room_party"]),
        "restaurant_rsvps": len([r for r in rsvps if r.party_type == "restaurant"]),
        "unread_messages": unread_messages,
        "active_event": active_event.title if active_event else None,
    }
