from __future__ import annotations


async def test_register_and_login_flow(client):
    register_resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "driver@example.com", "password": "supersecret1", "display_name": "Test Driver"},
    )
    assert register_resp.status_code == 201
    tokens = register_resp.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    me_resp = await client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {tokens['access_token']}"}
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "driver@example.com"

    dup_resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "driver@example.com", "password": "supersecret1", "display_name": "Test Driver"},
    )
    assert dup_resp.status_code == 409


async def test_login_wrong_password(client):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "driver2@example.com", "password": "correcthorse", "display_name": "D2"},
    )
    login_resp = await client.post(
        "/api/v1/auth/login",
        data={"username": "driver2@example.com", "password": "wrongpassword"},
    )
    assert login_resp.status_code == 401


async def test_me_without_token_is_unauthorized(client):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


async def test_password_over_bcrypt_limit_is_rejected(client):
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "longpass@example.com", "password": "x" * 100, "display_name": "Long"},
    )
    assert response.status_code == 422
