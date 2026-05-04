"""Tests for profile and CRUD endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_create_and_get_profile(client: AsyncClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await client.put("/api/v1/profile", json={
        "name": "Milan Khanal", "bio": "Test bio", "tagline": "Test tagline",
    }, headers=headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Milan Khanal"

    response = await client.get("/api/v1/profile")
    assert response.status_code == 200
    assert response.json()["name"] == "Milan Khanal"


@pytest.mark.asyncio
async def test_experience_crud(client: AsyncClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await client.post("/api/v1/experiences", json={
        "company": "Test Corp", "role": "Developer",
        "start_date": "2023-01-01", "tech_stack": ["Python", "React"],
    }, headers=headers)
    assert response.status_code == 201
    exp_id = response.json()["id"]

    response = await client.get("/api/v1/experiences")
    assert response.status_code == 200
    assert len(response.json()) >= 1

    response = await client.put(f"/api/v1/experiences/{exp_id}", json={
        "role": "Senior Developer",
    }, headers=headers)
    assert response.status_code == 200
    assert response.json()["role"] == "Senior Developer"

    response = await client.delete(f"/api/v1/experiences/{exp_id}", headers=headers)
    assert response.status_code == 204
