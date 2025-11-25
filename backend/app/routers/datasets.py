from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
from pathlib import Path
import pandas as pd
from app.database import get_db
from app import models, schemas
from app.config import settings

router = APIRouter(
    prefix="/datasets",
    tags=["datasets"]
)

@router.post("/upload", response_model=schemas.Dataset)
def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Only {', '.join(settings.ALLOWED_EXTENSIONS)} files are allowed."
        )
    
    # Read file content to check size
    file_content = file.file.read()
    file_size_mb = len(file_content) / (1024 * 1024)
    
    if file_size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File size ({file_size_mb:.2f}MB) exceeds maximum allowed size ({settings.MAX_UPLOAD_SIZE_MB}MB)"
        )
    
    # Reset file pointer and save
    file.file.seek(0)
    
    # Original filename and location
    original_filename = file.filename
    temp_location = settings.UPLOAD_DIR / original_filename
    
    try:
        # Save uploaded file temporarily
        with open(temp_location, "wb") as buffer:
            buffer.write(file_content)
        
        # Determine how to read the file
        if file_ext in ['.xlsx', '.xls']:
            df = pd.read_excel(temp_location)
            # Convert to CSV filename
            csv_filename = Path(original_filename).stem + ".csv"
            final_location = settings.UPLOAD_DIR / csv_filename
            # Save as CSV
            df.to_csv(final_location, index=False)
            # Remove original excel file to save space/confusion? 
            # For now, let's keep it or remove it. Let's remove it to keep storage clean.
            os.remove(temp_location)
            
        elif file_ext == '.json':
            df = pd.read_json(temp_location)
            csv_filename = Path(original_filename).stem + ".csv"
            final_location = settings.UPLOAD_DIR / csv_filename
            df.to_csv(final_location, index=False)
            os.remove(temp_location)
            
        else: # CSV
            df = pd.read_csv(temp_location)
            csv_filename = original_filename
            final_location = temp_location
            
        # Get file stats from the FINAL CSV file
        size_bytes = os.path.getsize(final_location)
        row_count, column_count = df.shape
        
        db_dataset = models.Dataset(
            filename=csv_filename, # Store as CSV filename
            filepath=str(final_location),
            size_bytes=size_bytes,
            row_count=row_count,
            column_count=column_count,
            status="Uploaded",
            parent_dataset_id=None
        )
        
        db.add(db_dataset)
        db.commit()
        db.refresh(db_dataset)
        
        return db_dataset
        
    except Exception as e:
        # Clean up files on error
        if os.path.exists(temp_location):
            os.remove(temp_location)
        # If we created a csv but failed later
        if 'final_location' in locals() and os.path.exists(final_location) and final_location != temp_location:
            os.remove(final_location)
            
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@router.get("/", response_model=List[schemas.Dataset])
def list_datasets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    datasets = db.query(models.Dataset).offset(skip).limit(limit).all()
    return datasets

@router.get("/{dataset_id}", response_model=schemas.Dataset)
def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset

@router.get("/{dataset_id}/preview")
def preview_dataset(dataset_id: int, rows: int = 5, db: Session = Depends(get_db)):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    df = pd.read_csv(dataset.filepath)
    # Replace NaN with None for JSON compatibility
    df = df.where(pd.notnull(df), None)
    return df.head(rows).to_dict(orient="records")

@router.delete("/{dataset_id}")
def delete_dataset(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    # Recursive deletion of children (processed datasets)
    children = db.query(models.Dataset).filter(models.Dataset.parent_dataset_id == dataset_id).all()
    for child in children:
        # Delete child file
        if os.path.exists(child.filepath):
            try:
                os.remove(child.filepath)
            except OSError:
                pass # Ignore if file already gone
        db.delete(child)
        
    # Remove file
    if os.path.exists(dataset.filepath):
        try:
            os.remove(dataset.filepath)
        except OSError:
            pass
        
    db.delete(dataset)
    db.commit()
    return {"message": "Dataset and derived files deleted successfully"}

@router.put("/{dataset_id}", response_model=schemas.Dataset)
def update_dataset(dataset_id: int, dataset_update: schemas.DatasetUpdate, db: Session = Depends(get_db)):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Update filename
    dataset.filename = dataset_update.filename
    db.commit()
    db.refresh(dataset)
    return dataset

@router.get("/{dataset_id}/download")
def download_dataset(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    if not os.path.exists(dataset.filepath):
        raise HTTPException(status_code=404, detail="File not found on server")
        
    return FileResponse(dataset.filepath, filename=dataset.filename, media_type='text/csv')
