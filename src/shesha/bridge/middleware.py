from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from starlette.types import ASGIApp

class ContentSizeLimitMiddleware(BaseHTTPMiddleware):
    """Enforce a maximum content size for all requests to prevent DoS."""
    
    def __init__(self, app: ASGIApp, max_content_size: int):
        super().__init__(app)
        self.max_content_size = max_content_size

    async def dispatch(self, request, call_next):
        if request.method in ("POST", "PUT", "PATCH"):
            content_length = request.headers.get("content-length")
            if content_length:
                if int(content_length) > self.max_content_size:
                    return Response(content="Payload Too Large", status_code=413)
            
            # Also check body size if content-length is missing but body is streamed
            # This is harder in BaseHTTPMiddleware without consuming the stream,
            # but for our local bridge, checking the header is a good baseline.
            
        return await call_next(request)
