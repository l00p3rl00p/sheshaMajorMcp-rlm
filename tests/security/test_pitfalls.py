import pytest
import os
import stat
from fastapi.testclient import TestClient
from pathlib import Path
from shesha.bridge.server import create_app
from shesha.librarian.paths import resolve_paths

@pytest.fixture
def client():
    app = create_app()
    with TestClient(app) as c:
        yield c

@pytest.fixture
def auth_key():
    from shesha.librarian.core import get_or_create_bridge_secret
    return get_or_create_bridge_secret()

def test_payload_size_limit(client, auth_key):
    """Secure Pitfalls: Infrastructure DOS (Resource Exhaustion).
    Verify that the bridge refuses oversized requests.
    """
    # 11MB payload (Limit should be 10MB)
    oversized_data = "A" * (11 * 1024 * 1024)
    # Use POST to a valid prefix to trigger middleware before 404/405
    response = client.post(
        "/api/health", 
        headers={"X-Bridge-Key": auth_key},
        content=oversized_data
    )
    # 413 Request Entity Too Large
    assert response.status_code == 413

def test_regex_dos_resilience():
    """Secure Pitfalls: Missing Input Sanitization (Regex DOS).
    Verify that extract_code_blocks doesn't hang on large/complex text.
    """
    from shesha.rlm.engine import extract_code_blocks
    # Craft a potentially problematic string for non-greedy DOTALL regex
    malicious_text = "```repl\n" + ("A" * 1_000_000) + "\n"
    # This should return an empty list or the block quickly, not hang
    import time
    start = time.time()
    extract_code_blocks(malicious_text)
    duration = time.time() - start
    assert duration < 1.0, f"Regex took too long: {duration}s"

def test_secret_file_permissions():
    """Secure Pitfalls: Least Privilege (PoLP).
    Verify that the bridge secret file is NOT world-readable.
    """
    paths = resolve_paths()
    secret_path = paths.secret
    
    # Delete and recreate to test the fix in get_or_create_bridge_secret
    if secret_path.exists():
        secret_path.unlink()
    
    from shesha.librarian.core import get_or_create_bridge_secret
    get_or_create_bridge_secret(paths)
    
    assert secret_path.exists()
    mode = os.stat(secret_path).st_mode
    # Should be 600 (33152 in decimal for 100600)
    # S_IRUSR (256) | S_IWUSR (128) = 384
    assert not (mode & stat.S_IRGRP), f"Secret is group-readable: {oct(mode)}"
    assert not (mode & stat.S_IROTH), f"Secret is world-readable: {oct(mode)}"

def test_path_traversal_denied():
    """Secure Pitfalls: Insecure File Uploads / Path Traversal.
    Verify that PathTraversalError is raised for dangerous inputs.
    """
    from shesha.security.paths import safe_path, PathTraversalError
    base = Path("/tmp/shesha_test")
    base.mkdir(exist_ok=True)
    
    with pytest.raises(PathTraversalError):
        safe_path(base, "../etc/passwd")
        
    with pytest.raises(PathTraversalError):
        safe_path(base, "docs", "../../etc/passwd")

    # Clean up
    if base.exists():
        import shutil
        shutil.rmtree(base)
