import pytest
from fastapi.testclient import TestClient
from shesha.bridge.server import create_app

@pytest.fixture
def client():
    app = create_app()
    with TestClient(app) as c:
        yield c

@pytest.fixture
def auth_key():
    from shesha.librarian.core import get_or_create_bridge_secret
    return get_or_create_bridge_secret()

def test_security_headers(client):
    """SecureConnect #69, #70, #71: Verify security headers are present."""
    response = client.get("/api/health")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert "default-src 'none'" in response.headers.get("Content-Security-Policy", "")

def test_authentication_enforced(client):
    """SecureConnect #57: Verify all endpoints are protected by authentication."""
    # No key provided
    response = client.get("/api/projects")
    assert response.status_code == 403
    
    # Invalid key provided
    response = client.get("/api/projects", headers={"X-Bridge-Key": "wrong-key"})
    assert response.status_code == 403

def test_authentication_success(client, auth_key):
    """Verify authenticated requests succeed."""
    response = client.get("/api/projects", headers={"X-Bridge-Key": auth_key})
    assert response.status_code == 200

def test_fingerprinting_headers_removed(client, auth_key):
    """SecureConnect #72: Verify fingerprinting headers are removed."""
    response = client.get("/api/health", headers={"X-Bridge-Key": auth_key})
    assert "X-Powered-By" not in response.headers
    server = response.headers.get("Server", "").lower()
    assert not server or "uvicorn" not in server

def test_rate_limiting(client, auth_key):
    """SecureConnect #33: Verify rate limiting (throttling) is active."""
    from shesha.bridge.limiter import limiter
    limiter.reset() # Ensure clean state for this test

    headers = {"X-Bridge-Key": auth_key}
    # Hit the limit (100/minute)
    # We'll do 100 requests, they should all be 200
    for _ in range(100):
        response = client.get("/api/health", headers=headers)
        assert response.status_code == 200, f"Failed at request {_}"

    # 101st request should be rate limited
    response = client.get("/api/health", headers=headers)
    assert response.status_code == 429
