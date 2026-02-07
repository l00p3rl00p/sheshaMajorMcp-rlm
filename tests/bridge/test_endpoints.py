import pytest
import shutil
from pathlib import Path
from fastapi.testclient import TestClient
from shesha.bridge.server import create_app
from shesha.librarian.core import LibrarianCore, get_or_create_bridge_secret
from shesha.librarian.paths import resolve_paths

# Setup a clean test environment
@pytest.fixture
def client(monkeypatch):
    temp_home = Path("./tests/bridge/temp_home")
    temp_storage = Path("./tests/bridge/temp_storage")
    temp_logs = temp_home / "logs"

    for path in [temp_home, temp_storage, temp_logs]:
        if path.exists():
            shutil.rmtree(path)
        path.mkdir(parents=True, exist_ok=True)

    monkeypatch.setenv("LIBRARIAN_HOME", str(temp_home))
    monkeypatch.setenv("LIBRARIAN_STORAGE_PATH", str(temp_storage))
    monkeypatch.setenv("LIBRARIAN_LOG_DIR", str(temp_logs))

    app = create_app()
    app.state.core = LibrarianCore(storage_path=temp_storage)
    key = get_or_create_bridge_secret(resolve_paths())

    with TestClient(app, headers={"X-Bridge-Key": key}) as c:
        yield c

    shutil.rmtree(temp_home, ignore_errors=True)
    shutil.rmtree(temp_storage, ignore_errors=True)

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

def test_projects_create_delete(client):
    mount_path = Path("./tests/bridge/temp_mount")
    mount_path.mkdir(parents=True, exist_ok=True)

    try:
        response = client.post(
            "/api/projects",
            json={"project_id": "alpha", "mount_path": str(mount_path)},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "alpha"

        response = client.get("/api/projects")
        assert response.status_code == 200
        assert len(response.json()) == 1

        response = client.delete("/api/projects/alpha")
        assert response.status_code == 200
        assert response.json()["ok"] is True
    finally:
        shutil.rmtree(mount_path, ignore_errors=True)

def test_query_endpoint(client):
    class FakeCore:
        def query(self, project_id: str, question: str) -> str:
            assert project_id == "alpha"
            assert question == "hello"
            return "world"

    client.app.state.core = FakeCore()

    response = client.post("/api/query", json={"project_id": "alpha", "question": "hello"})
    assert response.status_code == 200
    assert response.json()["answer"] == "world"
