
import asyncio
from datetime import date
from app.database import async_session
from app.models.birthday import BirthdayEvent
from app.services.crud_service import create_record

async def test_creation():
    async with async_session() as db:
        data = {
            "year": 2025,
            "birthday_date": date(2025, 5, 11),
            "title": "Test Event",
            "message_from_milan": "Hello",
            "restaurant_info": "Place",
            "is_active": True
        }
        try:
            event = await create_record(db, BirthdayEvent, data)
            print(f"Success: {event.id}")
        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_creation())
