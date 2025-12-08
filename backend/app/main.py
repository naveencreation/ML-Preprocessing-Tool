from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.utils.logging import setup_logging, get_logger

from app.routers import datasets, preprocessing, eda, workflows, training, inference

# Setup structured logging
setup_logging(level="INFO")
logger = get_logger("main")

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to ensure directories exist
@app.on_event("startup")
def startup_event():
    """Create necessary directories on startup"""
    settings.create_directories()
    logger.info(f"🚀 {settings.PROJECT_NAME} v{settings.PROJECT_VERSION} started")
    logger.info(f"📁 Upload directory: {settings.UPLOAD_DIR}")

app.include_router(datasets.router)
app.include_router(preprocessing.router)
app.include_router(eda.router)
app.include_router(workflows.router)
app.include_router(training.router)
app.include_router(inference.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to ML-Preprocessing-Tool API"}

