"""Email sending utility using SMTP."""

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from app.config import settings


async def send_email(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: Optional[str] = None,
) -> bool:
    """Send an email via SMTP. Returns True on success."""
    if not settings.EMAIL_USERNAME or not settings.EMAIL_PASSWORD:
        # Email not configured, log and skip
        print(f"[EMAIL] Skipping email to {to_email} — Email not configured")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
        msg["To"] = to_email
        msg["Subject"] = subject

        if text_body:
            msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            server.starttls()
            server.login(settings.EMAIL_USERNAME, settings.EMAIL_PASSWORD)
            server.send_message(msg)

        print(f"[EMAIL] Sent to {to_email}: {subject}")
        return True
    except Exception as e:
        print(f"[EMAIL] Failed to send to {to_email}: {e}")
        return False


def build_rsvp_confirmation_html(guest_name: str, party_type: str, event_title: str) -> str:
    """Build HTML email body for RSVP confirmation."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', sans-serif; background: #0f0f23; color: #e2e8f0; padding: 40px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; padding: 40px; }}
            h1 {{ color: #818cf8; margin-bottom: 8px; }}
            .badge {{ display: inline-block; background: #6366f1; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; }}
            .footer {{ margin-top: 32px; font-size: 12px; color: #64748b; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎉 RSVP Confirmed!</h1>
            <p>Hey <strong>{guest_name}</strong>,</p>
            <p>Your RSVP for <strong>{event_title}</strong> has been confirmed!</p>
            <p>Party type: <span class="badge">{"🏠 Room Party" if party_type == "room_party" else "🍽️ Restaurant"}</span></p>
            <p>We're looking forward to celebrating with you! 🎂</p>
            <div class="footer">
                <p>— Milan Khanal</p>
                <p>This email was sent from khanalmilan.com.np</p>
            </div>
        </div>
    </body>
    </html>
    """


def build_contact_notification_html(name: str, email: str, subject: str, message: str) -> str:
    """Build HTML email for contact form notification to Milan."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', sans-serif; background: #0f0f23; color: #e2e8f0; padding: 40px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; padding: 40px; }}
            h1 {{ color: #818cf8; }}
            .field {{ margin-bottom: 16px; }}
            .label {{ color: #94a3b8; font-size: 12px; text-transform: uppercase; }}
            .value {{ color: #e2e8f0; margin-top: 4px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📬 New Contact Message</h1>
            <div class="field">
                <div class="label">From</div>
                <div class="value">{name} ({email})</div>
            </div>
            <div class="field">
                <div class="label">Subject</div>
                <div class="value">{subject or 'No subject'}</div>
            </div>
            <div class="field">
                <div class="label">Message</div>
                <div class="value">{message}</div>
            </div>
        </div>
    </body>
    </html>
    """
