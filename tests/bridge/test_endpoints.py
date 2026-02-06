import pytest
import shutil
from pathlib import Path
from fastapi.testclient import TestClient
from shesha.bridge.server import create_app
from shesha.librarian.paths import resolve_paths

# Setup a clean test environment
@pytest.fixture
def client():
    # Use a temp directory for storage to ensure "Working Code" test isolation
    temp_storage = Path("./tests/bridge/temp_storage")
    if temp_storage.exists():
        shutil.rmtree(temp_storage)
    temp_storage.mkdir(parents=True)
    
    # Force the core to use this temp storage
    app = create_app()
    from shesha.librarian.core import LibrarianCore
    app.state.core = LibrarianCore(storage_path=temp_storage)
    
    with TestClient(app) as c:
        yield c
    
    shutil.rmtree(temp_storage)

def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"

def test_projects_endpoint_real(client):
    # 1. Initially empty
    response = client.get("/api/projects")
    assert response.status_code == 200
    assert response.json() == []

    # 2. Create a real project via the core (Working Logic)
    core = client.app.state.core
    core.create_project("real-mount", mount_path=Path("/tmp/fake-mount"))

    # 3. Verify the bridge reflects this real change
    response = client.get("/api/projects")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == "real-mount"
    assert data[0]["path"] == "/tmp/fake-mount"
