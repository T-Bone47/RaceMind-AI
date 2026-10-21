from __future__ import annotations

from httpx import ASGITransport, AsyncClient


async def test_request_id_header_present_on_every_response(client):
    response = await client.get("/health")
    assert "X-Request-ID" in response.headers
    assert len(response.headers["X-Request-ID"]) == 36  # uuid4 string length


async def test_unhandled_exception_returns_clean_500_not_a_traceback(client, db_session):
    """httpx's ASGITransport re-raises app exceptions by default (useful
    for normal test debugging, so the shared `client` fixture keeps that
    behavior) - this test specifically wants production-like behavior to
    verify the registered handler actually runs, so it builds its own
    transport with raise_app_exceptions=False rather than changing the
    shared fixture every other test relies on for real stack traces."""
    from api.main import app
    from database.session import get_db

    @app.get("/__test_boom")
    async def _boom() -> None:
        raise RuntimeError("deliberate failure for test coverage")

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app, raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://test") as boom_client:
        response = await boom_client.get("/__test_boom")

    assert response.status_code == 500
    body = response.json()
    assert body["detail"] == "An unexpected error occurred."
    assert "request_id" in body
    assert "Traceback" not in response.text
    assert "RuntimeError" not in response.text
