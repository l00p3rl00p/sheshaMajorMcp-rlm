from fastapi import FastAPI, Depends, HTTPException, Security, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from secure import Secure
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from shesha.bridge.limiter import limiter
from shesha.bridge.middleware import ContentSizeLimitMiddleware

from shesha.bridge.endpoints import router as api_router
from shesha.librarian.core import get_or_create_bridge_secret

def create_app() -> FastAPI:
    app = FastAPI(
        title="Shesha Local Bridge",
        description="Local backend bridge for Shesha RLM GUI",
        version="0.5.0"
    )

    # Configure CORS for local development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Content Size Limit (10MB) to prevent DoS
    app.add_middleware(ContentSizeLimitMiddleware, max_content_size=10 * 1024 * 1024)

    # Configure Rate Limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # Configure Secure Headers
    secure_headers = Secure.with_default_headers()

    @app.middleware("http")
    async def set_secure_headers(request, call_next):
        response = await call_next(request)
        secure_headers.set_headers(response)
        # Custom overrides for 'SecureConnect' alignment
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
        return response

    @app.middleware("http")
    async def remove_fingerprinting(request, call_next):
        response = await call_next(request)
        for header in ["X-Powered-By", "Server"]:
            if header in response.headers:
                del response.headers[header]
        return response

    # Auth dependency
    api_key_header = APIKeyHeader(name="X-Bridge-Key", auto_error=False)

    async def verify_bridge_key(
        request: Request,
        api_key: str = Security(api_key_header),
    ):
        if request.method == "OPTIONS":
            return api_key
        expected = get_or_create_bridge_secret()
        if api_key != expected:
            raise HTTPException(
                status_code=403,
                detail="Invalid or missing Bridge Secret. Use 'librarian gui' to launch."
            )
        return api_key

    from shesha.librarian.core import LibrarianCore
    from shesha.librarian.paths import resolve_paths

    # Mount API with Auth and Rate Limiting
    app.include_router(
        api_router, 
        prefix="/api",
        dependencies=[Depends(verify_bridge_key)]
    )

    paths = resolve_paths()
    app.state.core = LibrarianCore(storage_path=paths.storage)

    return app

def run_server(host: str = "127.0.0.1", port: int = 8000):
    import uvicorn
    # Use the factory string to enable reload support if needed, 
    # but here we pass the app instance directly for a simple CLI runner.
    app = create_app()
    print(f"🌉 Shesha Bridge starting on http://{host}:{port}")
    uvicorn.run(app, host=host, port=port)
