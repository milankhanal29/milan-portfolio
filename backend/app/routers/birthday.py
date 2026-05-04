"""Birthday router — public + admin endpoints for events, menu, RSVP, wishes."""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_admin
from app.models.birthday import BirthdayEvent, MenuItem
from app.models.user import User
from app.schemas.birthday import (
    BirthdayEventCreate, BirthdayEventUpdate, BirthdayEventResponse, BirthdayActiveResponse,
    MenuItemCreate, MenuItemUpdate, MenuItemResponse,
    RSVPCreate, RSVPResponse, RSVPMenuSelectionResponse, WishResponse,
)
from app.services.birthday_service import (
    get_active_event, get_countdown_data, get_available_menu_items,
    create_rsvp, get_all_rsvps, get_wishes, get_admin_stats,
)
from app.services.crud_service import get_all, get_by_id, create_record, update_record, delete_record
from app.utils.cache import cache_get, cache_set, cache_invalidate_prefix
from app.utils.email import send_email, build_rsvp_confirmation_html
import json

router = APIRouter(prefix="/birthday", tags=["Birthday"])


# ==================== Public ====================

@router.get("/active", response_model=BirthdayActiveResponse)
async def get_active_birthday(db: AsyncSession = Depends(get_db)):
    """Get the active birthday event with countdown data."""
    event = await get_active_event(db)
    if not event:
        raise HTTPException(status_code=404, detail="No active birthday event")

    countdown = await get_countdown_data(event)
    return BirthdayActiveResponse(
        event=BirthdayEventResponse.model_validate(event, from_attributes=True),
        countdown_seconds=countdown["countdown_seconds"],
        age=countdown["age"],
    )


@router.get("/menu", response_model=dict)
async def get_menu(db: AsyncSession = Depends(get_db)):
    """Get available menu items grouped by category."""
    cached = await cache_get("birthday:menu")
    if cached:
        return json.loads(cached)

    grouped = await get_available_menu_items(db)
    response = {}
    for cat, items in grouped.items():
        response[cat] = [
            MenuItemResponse.model_validate(i, from_attributes=True).model_dump(mode="json")
            for i in items
        ]

    await cache_set("birthday:menu", json.dumps(response, default=str))
    return response


@router.post("/rsvp", response_model=RSVPResponse, status_code=201)
async def submit_rsvp(
    data: RSVPCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Create an RSVP with menu selections."""
    rsvp = await create_rsvp(db, data)

    # Build response with menu item names
    selections = []
    for sel in rsvp.menu_selections:
        selections.append(RSVPMenuSelectionResponse(
            id=str(sel.id),
            menu_item_id=str(sel.menu_item_id),
            menu_item_name=sel.menu_item.name if sel.menu_item else "Unknown",
            quantity=sel.quantity,
        ))

    # Send confirmation email if guest provided email
    if data.guest_email:
        event = await get_by_id(db, BirthdayEvent, data.event_id)
        event_title = event.title if event else "Birthday Party"
        html = build_rsvp_confirmation_html(data.guest_name, data.party_type, event_title)
        background_tasks.add_task(send_email, data.guest_email, "RSVP Confirmed! 🎉", html)

    await cache_invalidate_prefix("birthday:wishes")

    return RSVPResponse(
        id=str(rsvp.id),
        event_id=str(rsvp.event_id),
        guest_name=rsvp.guest_name,
        guest_email=rsvp.guest_email,
        party_type=rsvp.party_type,
        table_guests=rsvp.table_guests,
        special_note=rsvp.special_note,
        menu_selections=selections,
        created_at=rsvp.created_at,
    )


@router.get("/wishes", response_model=List[WishResponse])
async def list_wishes(db: AsyncSession = Depends(get_db)):
    """Public list of wishes (names only)."""
    cached = await cache_get("birthday:wishes")
    if cached:
        return json.loads(cached)

    items = await get_wishes(db)
    response = [
        WishResponse(
            guest_name=r.guest_name,
            special_note=r.special_note,
            party_type=r.party_type,
            created_at=r.created_at,
        ).model_dump(mode="json")
        for r in items
    ]
    await cache_set("birthday:wishes", json.dumps(response, default=str))
    return response


# ==================== Admin ====================

@router.get("/rsvps", response_model=List[RSVPResponse])
async def admin_list_rsvps(
    event_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin: get all RSVPs with full details."""
    rsvps = await get_all_rsvps(db, event_id)
    result = []
    for rsvp in rsvps:
        selections = [
            RSVPMenuSelectionResponse(
                id=str(s.id),
                menu_item_id=str(s.menu_item_id),
                menu_item_name=s.menu_item.name if s.menu_item else "Unknown",
                quantity=s.quantity,
            ) for s in rsvp.menu_selections
        ]
        result.append(RSVPResponse(
            id=str(rsvp.id),
            event_id=str(rsvp.event_id),
            guest_name=rsvp.guest_name,
            guest_email=rsvp.guest_email,
            party_type=rsvp.party_type,
            table_guests=rsvp.table_guests,
            special_note=rsvp.special_note,
            menu_selections=selections,
            created_at=rsvp.created_at,
        ))
    return result


@router.get("/stats")
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin dashboard statistics."""
    return await get_admin_stats(db)


# --- Event CRUD ---
@router.get("/events", response_model=List[BirthdayEventResponse])
async def list_events(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    items = await get_all(db, BirthdayEvent, order_by=BirthdayEvent.year.desc())
    return [BirthdayEventResponse.model_validate(i, from_attributes=True) for i in items]


@router.post("/events", response_model=BirthdayEventResponse, status_code=201)
async def create_event(
    data: BirthdayEventCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    item = await create_record(db, BirthdayEvent, data.model_dump())
    return BirthdayEventResponse.model_validate(item, from_attributes=True)


@router.put("/events/{item_id}", response_model=BirthdayEventResponse)
async def update_event(
    item_id: str, data: BirthdayEventUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    item = await update_record(db, BirthdayEvent, item_id, data.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Event not found")
    return BirthdayEventResponse.model_validate(item, from_attributes=True)


@router.delete("/events/{item_id}", status_code=204)
async def delete_event(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if not await delete_record(db, BirthdayEvent, item_id):
        raise HTTPException(status_code=404, detail="Event not found")


# --- Menu Item CRUD ---
@router.get("/menu-items", response_model=List[MenuItemResponse])
async def admin_list_menu(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    items = await get_all(db, MenuItem, order_by=MenuItem.order)
    return [MenuItemResponse.model_validate(i, from_attributes=True) for i in items]


@router.post("/menu-items", response_model=MenuItemResponse, status_code=201)
async def create_menu_item(
    data: MenuItemCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    item = await create_record(db, MenuItem, data.model_dump())
    await cache_invalidate_prefix("birthday:menu")
    return MenuItemResponse.model_validate(item, from_attributes=True)


@router.put("/menu-items/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(
    item_id: str, data: MenuItemUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    item = await update_record(db, MenuItem, item_id, data.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    await cache_invalidate_prefix("birthday:menu")
    return MenuItemResponse.model_validate(item, from_attributes=True)


@router.delete("/menu-items/{item_id}", status_code=204)
async def delete_menu_item(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if not await delete_record(db, MenuItem, item_id):
        raise HTTPException(status_code=404, detail="Menu item not found")
    await cache_invalidate_prefix("birthday:menu")
