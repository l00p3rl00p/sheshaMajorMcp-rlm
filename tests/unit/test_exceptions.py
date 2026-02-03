"""Tests for exception classes."""

from shesha.exceptions import AuthenticationError, RepoIngestError


class TestRepoExceptions:
    """Tests for repository-related exceptions."""

    def test_authentication_error_message(self):
        """AuthenticationError formats message with URL."""
        err = AuthenticationError("https://github.com/org/private-repo")
        assert "private-repo" in str(err)
        assert "token" in str(err).lower()

    def test_repo_ingest_error_preserves_cause(self):
        """RepoIngestError preserves the original cause."""
        cause = RuntimeError("git clone failed")
        err = RepoIngestError("https://github.com/org/repo", cause)
        assert err.__cause__ is cause
        assert "https://github.com/org/repo" in str(err)
