from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import notes, folders, upload

app = FastAPI(
    title="SupaNote API",
    description="Backend API for SupaNote - a modern notes application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(notes.router, prefix="/notes", tags=["notes"])
app.include_router(folders.router, prefix="/folders", tags=["folders"])
app.include_router(upload.router, prefix="/upload", tags=["upload"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to SupaNote API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
