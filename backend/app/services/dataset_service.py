import shutil
import os
from pathlib import Path
import pandas as pd
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.config import settings

def handle_file_upload(file: UploadFile, db: Session) -> models.Dataset:
    """
    Handles the file upload process:
    1. Validates extension and size.
    2. Saves the file temporarily.
    3. Converts to CSV if necessary (Excel, JSON).
    4. Determines dataset type.
    5. Creates database entry.
    """
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content to check size
    try:
        file_content = file.file.read()
        file_size_mb = len(file_content) / (1024 * 1024)
        
        if file_size_mb > settings.MAX_UPLOAD_SIZE_MB:
            raise HTTPException(
                status_code=400,
                detail=f"File size ({file_size_mb:.2f}MB) exceeds maximum allowed size ({settings.MAX_UPLOAD_SIZE_MB}MB)"
            )
        
        # Reset file pointer
        file.file.seek(0)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
    
    # Original filename and location
    original_filename = file.filename
    temp_location = settings.UPLOAD_DIR / original_filename
    
    # Determine dataset type based on extension
    dataset_type = "tabular"
    if file_ext in ['.txt', '.pdf', '.docx']:
        dataset_type = "text"
    elif file_ext in ['.jpg', '.png', '.tiff', '.jpeg', '.bmp', '.gif', '.webp']:
        dataset_type = "image"
    elif file_ext in ['.wav', '.mp3', '.flac', '.ogg', '.m4a']:
        dataset_type = "audio"
    elif file_ext in ['.mp4', '.avi', '.mov', '.mkv', '.webm']:
        dataset_type = "video"
    elif file_ext in ['.log']:
        dataset_type = "logs"
    
    try:
        # Save uploaded file temporarily
        with open(temp_location, "wb") as buffer:
            buffer.write(file_content)
        
        final_location = temp_location
        csv_filename = original_filename
        row_count = 0
        column_count = 0

        # Handle Tabular Data (Convert/Validate)
        if dataset_type == "tabular":
            # Determine how to read the file and convert if needed
            if file_ext in ['.xlsx', '.xls']:
                try:
                    df = pd.read_excel(temp_location)
                    # Convert to CSV filename
                    csv_filename = Path(original_filename).stem + ".csv"
                    final_location = settings.UPLOAD_DIR / csv_filename
                    # Save as CSV
                    df.to_csv(final_location, index=False)
                    # Remove original excel file
                    os.remove(temp_location)
                except Exception as e:
                    raise HTTPException(status_code=400, detail=f"Error converting Excel file: {str(e)}")
                
            elif file_ext == '.json':
                try:
                    df = pd.read_json(temp_location)
                    csv_filename = Path(original_filename).stem + ".csv"
                    final_location = settings.UPLOAD_DIR / csv_filename
                    df.to_csv(final_location, index=False)
                    os.remove(temp_location)
                except Exception as e:
                    raise HTTPException(status_code=400, detail=f"Error converting JSON file: {str(e)}")
                
            else: # CSV
                try:
                    # Verify it's readable as CSV
                    df = pd.read_csv(temp_location)
                    csv_filename = original_filename
                    final_location = temp_location
                except Exception as e:
                    raise HTTPException(status_code=400, detail=f"Error reading CSV file: {str(e)}")
            
            # Get stats for tabular data
            row_count, column_count = df.shape

        # Handle Non-Tabular Data (Just get stats)
        else:
            # For text/logs, we might want to count lines
            if dataset_type in ["text", "logs"]:
                try:
                    with open(final_location, 'r', encoding='utf-8', errors='ignore') as f:
                        row_count = sum(1 for _ in f)
                    column_count = 1 # Treat as single column
                except:
                    pass # Best effort
            
            # For images/audio/video, row_count doesn't apply in the same way, maybe set to 1
            if dataset_type in ["image", "audio", "video"]:
                row_count = 1
                column_count = 1

        # Get file stats
        size_bytes = os.path.getsize(final_location)
            
        db_dataset = models.Dataset(
            filename=csv_filename, # Store as CSV filename or original
            filepath=str(final_location),
            size_bytes=size_bytes,
            row_count=row_count,
            column_count=column_count,
            status="Uploaded",
            dataset_type=dataset_type,
            parent_dataset_id=None
        )
        
        db.add(db_dataset)
        db.commit()
        db.refresh(db_dataset)
        
        return db_dataset
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Clean up files on generic error
        if os.path.exists(temp_location):
            try:
                os.remove(temp_location)
            except:
                pass
        # If we created a csv but failed later
        if 'final_location' in locals() and os.path.exists(final_location) and final_location != temp_location:
            try:
                os.remove(final_location)
            except:
                pass
    
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
