import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "ML Preprocessing Tool"
    PROJECT_VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./data/app.db")
    
    # File Storage
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    UPLOAD_DIR: Path = DATA_DIR / "uploads"
    PROCESSED_DIR: Path = DATA_DIR / "processed"
    ARTIFACTS_DIR: Path = DATA_DIR / "artifacts"
    
    # File Upload Limits
    MAX_UPLOAD_SIZE_MB: int = 100
    ALLOWED_EXTENSIONS: set = {
        # Tabular
        ".csv", ".xlsx", ".xls", ".sql", 
        # Text
        ".txt", ".pdf", ".docx", ".json", 
        # Image
        ".jpg", ".png", ".tiff", ".jpeg", ".bmp", ".gif", ".webp",
        # Audio
        ".wav", ".mp3", ".flac", ".ogg", ".m4a",
        # Video
        ".mp4", ".avi", ".mov", ".mkv", ".webm",
        # Logs
        ".log"
    }
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"]
    
    def create_directories(self):
        """Create necessary directories if they don't exist"""
        self.DATA_DIR.mkdir(exist_ok=True)
        self.UPLOAD_DIR.mkdir(exist_ok=True)
        self.PROCESSED_DIR.mkdir(exist_ok=True)
        self.ARTIFACTS_DIR.mkdir(exist_ok=True)

settings = Settings()
