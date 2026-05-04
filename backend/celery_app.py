"""Celery application with background tasks."""

from celery import Celery
from celery.schedules import crontab

from app.config import settings

celery_app = Celery(
    "portfolio",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

# Beat schedule — birthday reminder 7 days before
celery_app.conf.beat_schedule = {
    "check-birthday-reminders": {
        "task": "celery_app.check_birthday_reminders",
        "schedule": crontab(hour=9, minute=0),  # Daily at 9 AM UTC
    },
}


@celery_app.task(name="celery_app.send_rsvp_confirmation")
def send_rsvp_confirmation(guest_email: str, guest_name: str, party_type: str, event_title: str):
    """Send RSVP confirmation email via Celery."""
    import asyncio
    from app.utils.email import send_email, build_rsvp_confirmation_html

    html = build_rsvp_confirmation_html(guest_name, party_type, event_title)
    asyncio.run(send_email(guest_email, "RSVP Confirmed! 🎉", html))


@celery_app.task(name="celery_app.check_birthday_reminders")
def check_birthday_reminders():
    """Check if birthday is 7 days away and send reminder emails to RSVPs."""
    import asyncio
    from datetime import date, timedelta
    from sqlalchemy import select

    async def _check():
        from app.database import async_session
        from app.models.birthday import BirthdayEvent, RSVP

        async with async_session() as db:
            result = await db.execute(
                select(BirthdayEvent).where(BirthdayEvent.is_active == True)
            )
            event = result.scalar_one_or_none()
            if not event:
                return

            today = date.today()
            days_until = (event.birthday_date - today).days

            if days_until == 7:
                # Get all RSVPs with emails
                rsvp_result = await db.execute(
                    select(RSVP).where(
                        RSVP.event_id == event.id,
                        RSVP.guest_email.isnot(None),
                    )
                )
                rsvps = rsvp_result.scalars().all()

                from app.utils.email import send_email

                for rsvp in rsvps:
                    if rsvp.guest_email:
                        html = f"""
                        <div style="font-family:sans-serif;padding:20px;">
                            <h2>🎂 Reminder: Milan's Birthday in 7 Days!</h2>
                            <p>Hey {rsvp.guest_name},</p>
                            <p>Just a reminder that Milan's birthday celebration is coming up in one week!</p>
                            <p>Your RSVP: <strong>{"🏠 Room Party" if rsvp.party_type == "room_party" else "🍽️ Restaurant"}</strong></p>
                            <p>See you there! 🎉</p>
                        </div>
                        """
                        await send_email(rsvp.guest_email, "🎂 Birthday Reminder - 7 Days!", html)

    asyncio.run(_check())
