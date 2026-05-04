"""Birthday event schemas."""

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


# --- BirthdayEvent ---

class BirthdayEventCreate(BaseModel):
    year: int
    birthday_date: date
    title: str
    message_from_milan: Optional[str] = None
    restaurant_info: Optional[str] = None
    is_active: bool = True


class BirthdayEventUpdate(BaseModel):
    year: Optional[int] = None
    birthday_date: Optional[date] = None
    title: Optional[str] = None
    message_from_milan: Optional[str] = None
    restaurant_info: Optional[str] = None
    is_active: Optional[bool] = None


class BirthdayEventResponse(BaseModel):
    id: str
    year: int
    birthday_date: date
    title: str
    message_from_milan: Optional[str] = None
    restaurant_info: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class BirthdayActiveResponse(BaseModel):
    """Response for the public active birthday endpoint."""
    event: BirthdayEventResponse
    countdown_seconds: int
    age: int


# --- MenuItem ---

class MenuItemCreate(BaseModel):
    name: str
    category: str  # food | drink
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_available: bool = True
    is_veg: bool = False
    order: int = 0


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    is_veg: Optional[bool] = None
    order: Optional[int] = None


class MenuItemResponse(BaseModel):
    id: str
    name: str
    category: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_available: bool
    is_veg: bool
    order: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- RSVP ---

class MenuSelectionItem(BaseModel):
    menu_item_id: str
    quantity: int = 1


class RSVPCreate(BaseModel):
    event_id: str
    guest_name: str
    guest_email: Optional[EmailStr] = None
    party_type: str  # room_party | restaurant
    table_guests: Optional[int] = None
    special_note: Optional[str] = None
    menu_selections: List[MenuSelectionItem] = []


class RSVPMenuSelectionResponse(BaseModel):
    id: str
    menu_item_id: str
    menu_item_name: str
    quantity: int

    class Config:
        from_attributes = True


class RSVPResponse(BaseModel):
    id: str
    event_id: str
    guest_name: str
    guest_email: Optional[str] = None
    party_type: str
    table_guests: Optional[int] = None
    special_note: Optional[str] = None
    menu_selections: List[RSVPMenuSelectionResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class WishResponse(BaseModel):
    """Public wish — only guest name and note."""
    guest_name: str
    special_note: Optional[str] = None
    party_type: str
    created_at: datetime

    class Config:
        from_attributes = True
