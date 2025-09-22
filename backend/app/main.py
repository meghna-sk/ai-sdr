from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import RedirectResponse
from app.db import create_tables
from app.routers import leads, grok, evals, meetings

class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Check if request is HTTP and redirect to HTTPS
        if request.url.scheme == "http" and request.headers.get("host"):
            https_url = request.url.replace(scheme="https")
            return RedirectResponse(url=str(https_url), status_code=301)
        return await call_next(request)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_tables()
    yield
    # Shutdown (cleanup if needed)


app = FastAPI(title="AI SDR API", version="1.0.0", lifespan=lifespan)

# Add HTTPS redirect middleware
app.add_middleware(HTTPSRedirectMiddleware)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI SDR API"}

# Include routers
app.include_router(leads.router)
app.include_router(grok.router)
app.include_router(evals.router)
app.include_router(meetings.router)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "https://ai-sdr-frontend-acds.onrender.com",  # Render frontend HTTPS
        "http://ai-sdr-frontend-acds.onrender.com",  # Render frontend HTTP (in case of redirects)
        "https://ai-sdr-k9ml.onrender.com",  # Alternative frontend URL HTTPS
        "http://ai-sdr-k9ml.onrender.com",  # Alternative frontend URL HTTP (in case of redirects)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/healthz")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "grok-sdr-api"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Grok SDR API", "version": "1.0.0"}
