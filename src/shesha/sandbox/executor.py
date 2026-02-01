"""Docker container executor for sandboxed code execution."""

import json
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

import docker
from docker.models.containers import Container


@dataclass
class ExecutionResult:
    """Result of code execution in sandbox."""

    status: str
    stdout: str
    stderr: str
    return_value: Any
    error: str | None
    final_answer: str | None = None
    final_var: str | None = None
    final_value: str | None = None


LLMQueryHandler = Callable[[str, str], str]  # (instruction, content) -> response


class ContainerExecutor:
    """Execute code in a Docker container."""

    def __init__(
        self,
        image: str = "shesha-sandbox",
        memory_limit: str = "512m",
        cpu_count: int = 1,
        llm_query_handler: LLMQueryHandler | None = None,
    ) -> None:
        """Initialize executor with container settings."""
        self.image = image
        self.memory_limit = memory_limit
        self.cpu_count = cpu_count
        self.llm_query_handler = llm_query_handler
        self._client: docker.DockerClient | None = None
        self._container: Container | None = None
        self._socket: Any = None

    def start(self) -> None:
        """Start a container for execution."""
        self._client = docker.from_env()
        self._container = self._client.containers.run(
            self.image,
            detach=True,
            stdin_open=True,
            tty=False,
            mem_limit=self.memory_limit,
            cpu_count=self.cpu_count,
            network_disabled=True,  # No network - llm_query goes through host
        )
        # Attach to container for bidirectional communication
        self._socket = self._container.attach_socket(params={"stdin": 1, "stdout": 1, "stream": 1})

    def stop(self) -> None:
        """Stop and remove the container."""
        if self._socket:
            self._socket.close()
            self._socket = None
        if self._container:
            try:
                self._container.stop(timeout=5)
            except Exception:
                pass
            try:
                self._container.remove(force=True)
            except Exception:
                pass
            self._container = None

    def setup_context(self, context: list[str]) -> None:
        """Initialize the context variable in the container."""
        self._send_command({"action": "setup", "context": context})

    def execute(self, code: str, timeout: int = 30) -> ExecutionResult:
        """Execute code in the container, handling llm_query callbacks."""
        self._send_raw(json.dumps({"action": "execute", "code": code}) + "\n")

        # Handle responses, which may include llm_query requests
        while True:
            response_line = self._read_line(timeout=timeout)
            result = json.loads(response_line)

            # Check if this is an llm_query request
            if result.get("action") == "llm_query":
                if self.llm_query_handler is None:
                    # No handler - send error back
                    self._send_raw(
                        json.dumps(
                            {
                                "action": "llm_response",
                                "result": "ERROR: No LLM query handler configured",
                            }
                        )
                        + "\n"
                    )
                else:
                    # Call handler and send response back
                    llm_response = self.llm_query_handler(
                        result["instruction"],
                        result["content"],
                    )
                    self._send_raw(
                        json.dumps(
                            {
                                "action": "llm_response",
                                "result": llm_response,
                            }
                        )
                        + "\n"
                    )
                continue

            # This is the final execution result
            return ExecutionResult(
                status=result.get("status", "error"),
                stdout=result.get("stdout", ""),
                stderr=result.get("stderr", ""),
                return_value=result.get("return_value"),
                error=result.get("error"),
                final_answer=result.get("final_answer"),
                final_var=result.get("final_var"),
                final_value=result.get("final_value"),
            )

    def _send_raw(self, data: str) -> None:
        """Send raw data to container stdin."""
        if self._socket:
            self._socket._sock.sendall(data.encode())

    def _read_line(self, timeout: int = 30) -> str:
        """Read a line from container stdout."""
        if self._socket:
            self._socket._sock.settimeout(timeout)
            data = b""
            while not data.endswith(b"\n"):
                chunk = self._socket._sock.recv(4096)
                if not chunk:
                    break
                data += chunk
            return data.decode().strip()
        raise RuntimeError("No socket connection")

    def _send_command(self, command: dict[str, Any], timeout: int = 30) -> dict[str, Any]:
        """Send a JSON command to the container and get response."""
        self._send_raw(json.dumps(command) + "\n")
        response = self._read_line(timeout=timeout)
        result: dict[str, Any] = json.loads(response)
        return result

    def __enter__(self) -> "ContainerExecutor":
        """Context manager entry."""
        self.start()
        return self

    def __exit__(self, *args: Any) -> None:
        """Context manager exit."""
        self.stop()
