"""Initial migration — all tables

Revision ID: 001_initial
Revises:
Create Date: 2024-01-01

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("is_admin", sa.Boolean(), default=False),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Profiles
    op.create_table(
        "profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("tagline", sa.String(500), nullable=True),
        sa.Column("social_links", postgresql.JSON(), default={}),
        sa.Column("resume_url", sa.String(500), nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("dob", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Experiences
    op.create_table(
        "experiences",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company", sa.String(255), nullable=False),
        sa.Column("role", sa.String(255), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("tech_stack", postgresql.ARRAY(sa.String()), default=[]),
        sa.Column("logo_url", sa.String(500), nullable=True),
        sa.Column("is_current", sa.Boolean(), default=False),
        sa.Column("order", sa.Integer(), default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Projects
    op.create_table(
        "projects",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("tech_stack", postgresql.ARRAY(sa.String()), default=[]),
        sa.Column("github_url", sa.String(500), nullable=True),
        sa.Column("live_url", sa.String(500), nullable=True),
        sa.Column("cover_image", sa.String(500), nullable=True),
        sa.Column("featured", sa.Boolean(), default=False),
        sa.Column("order", sa.Integer(), default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Blog Posts
    op.create_table(
        "blog_posts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("slug", sa.String(500), unique=True, nullable=False, index=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("tags", postgresql.ARRAY(sa.String()), default=[]),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cover_image", sa.String(500), nullable=True),
        sa.Column("is_published", sa.Boolean(), default=False),
        sa.Column("views", sa.Integer(), default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Skills
    op.create_table(
        "skills",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("proficiency", sa.Integer(), default=3),
        sa.Column("icon_url", sa.String(500), nullable=True),
        sa.Column("order", sa.Integer(), default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Testimonials
    op.create_table(
        "testimonials",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("author_name", sa.String(255), nullable=False),
        sa.Column("author_role", sa.String(255), nullable=True),
        sa.Column("company", sa.String(255), nullable=True),
        sa.Column("avatar", sa.String(500), nullable=True),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("is_featured", sa.Boolean(), default=False),
        sa.Column("order", sa.Integer(), default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Site Settings
    op.create_table(
        "site_settings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("meta_title", sa.String(255), default="Milan Khanal — Portfolio"),
        sa.Column("meta_description", sa.String(500)),
        sa.Column("og_image", sa.String(500), nullable=True),
        sa.Column("favicon", sa.String(500), nullable=True),
        sa.Column("accent_color", sa.String(20), default="#6366f1"),
        sa.Column("maintenance_mode", sa.Boolean(), default=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Contact Messages
    op.create_table(
        "contact_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("subject", sa.String(500), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("is_read", sa.Boolean(), default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Birthday Events
    op.create_table(
        "birthday_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("birthday_date", sa.Date(), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("message_from_milan", sa.Text(), nullable=True),
        sa.Column("restaurant_info", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Menu Items
    op.create_table(
        "menu_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("is_available", sa.Boolean(), default=True),
        sa.Column("is_veg", sa.Boolean(), default=False),
        sa.Column("order", sa.Integer(), default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # RSVPs
    op.create_table(
        "rsvps",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("event_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("birthday_events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("guest_name", sa.String(255), nullable=False),
        sa.Column("guest_email", sa.String(255), nullable=True),
        sa.Column("party_type", sa.String(50), nullable=False),
        sa.Column("table_guests", sa.Integer(), nullable=True),
        sa.Column("special_note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # RSVP Menu Selections
    op.create_table(
        "rsvp_menu_selections",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("rsvp_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("rsvps.id", ondelete="CASCADE"), nullable=False),
        sa.Column("menu_item_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=False),
        sa.Column("quantity", sa.Integer(), default=1),
    )


def downgrade() -> None:
    op.drop_table("rsvp_menu_selections")
    op.drop_table("rsvps")
    op.drop_table("menu_items")
    op.drop_table("birthday_events")
    op.drop_table("contact_messages")
    op.drop_table("site_settings")
    op.drop_table("testimonials")
    op.drop_table("skills")
    op.drop_table("blog_posts")
    op.drop_table("projects")
    op.drop_table("experiences")
    op.drop_table("profiles")
    op.drop_table("users")
