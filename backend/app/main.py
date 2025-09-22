from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import create_tables
from app.routers import leads, grok, evals, meetings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_tables()
    yield
    # Shutdown (cleanup if needed)


app = FastAPI(title="AI SDR API", version="1.0.0", lifespan=lifespan)

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
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://ai-sdr-frontend-acds.onrender.com",
        "https://ai-sdr-k9ml.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "AI SDR API", "version": "1.0.0"}
