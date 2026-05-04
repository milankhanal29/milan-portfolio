"""Tests for birthday RSVP flow."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_birthday_rsvp_flow(client: AsyncClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Create event
    response = await client.post("/api/v1/birthday/events", json={
        "year": 2025, "birthday_date": "2025-05-15",
        "title": "Test Birthday", "is_active": True,
    }, headers=headers)
    assert response.status_code == 201
    event_id = response.json()["id"]

    # Create menu item
    response = await client.post("/api/v1/birthday/menu-items", json={
        "name": "Cake", "category": "food", "description": "Chocolate cake",
    }, headers=headers)
    assert response.status_code == 201
    menu_id = response.json()["id"]

    # Get active event
    response = await client.get("/api/v1/birthday/active")
    assert response.status_code == 200
    assert response.json()["event"]["title"] == "Test Birthday"

    # Get menu
    response = await client.get("/api/v1/birthday/menu")
    assert response.status_code == 200

    # Submit RSVP
    response = await client.post("/api/v1/birthday/rsvp", json={
        "event_id": event_id, "guest_name": "Test Guest",
        "party_type": "room_party",
        "menu_selections": [{"menu_item_id": menu_id, "quantity": 2}],
    })
    assert response.status_code == 201
    assert response.json()["guest_name"] == "Test Guest"

    # Get wishes
    response = await client.get("/api/v1/birthday/wishes")
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # Admin: get RSVPs
    response = await client.get("/api/v1/birthday/rsvps", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1
