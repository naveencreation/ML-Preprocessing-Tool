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
from app.services import dataset_service

router = APIRouter(
    prefix="/datasets",
    tags=["datasets"]
)

@router.post("/upload", response_model=schemas.Dataset)
def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return dataset_service.handle_file_upload(file, db)

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
def preview_dataset(
    dataset_id: int, 
    page: int = 1,
    page_size: int = 100,
    sort_by: str = None,
    sort_order: str = "asc",
    db: Session = Depends(get_db)
):
    """
    Get a paginated preview of the dataset with optional sorting.
    
    Args:
        dataset_id: ID of the dataset
        page: Page number (1-indexed)
        page_size: Number of rows per page
        sort_by: Column name to sort by (optional)
        sort_order: 'asc' or 'desc'
    """
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        # Handle different dataset types
        if dataset.dataset_type == "tabular" or not dataset.dataset_type:
            df = pd.read_csv(dataset.filepath)
            total_rows = len(df)
            total_pages = (total_rows + page_size - 1) // page_size  # Ceiling division
            
            # Validate page number
            if page < 1:
                page = 1
            if page > total_pages:
                page = total_pages
            
            # Apply sorting if specified
            if sort_by and sort_by in df.columns:
                ascending = (sort_order.lower() == "asc")
                df = df.sort_values(by=sort_by, ascending=ascending)
            
            # Calculate pagination
            start_idx = (page - 1) * page_size
            end_idx = start_idx + page_size
            
            # Get page data
            page_data = df.iloc[start_idx:end_idx].copy()
            
            # Replace NaN with None for JSON compatibility
            page_data = page_data.where(pd.notnull(page_data), None)
            
            return {
                "data": page_data.to_dict(orient="records"),
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_rows": total_rows,
                    "total_pages": total_pages,
                    "has_next": page < total_pages,
                    "has_prev": page > 1
                },
                "columns": df.columns.tolist(),
                "dtypes": df.dtypes.astype(str).to_dict(),
                "dataset_type": dataset.dataset_type
            }
        
        elif dataset.dataset_type in ["text", "logs"]:
            # Read first N lines for text/logs
            lines = []
            total_rows = 0
            with open(dataset.filepath, 'r', encoding='utf-8', errors='ignore') as f:
                # Count total lines (might be expensive for huge files, but okay for now)
                # For preview, maybe just read a chunk
                all_lines = f.readlines()
                total_rows = len(all_lines)
                
            total_pages = (total_rows + page_size - 1) // page_size
            
            if page < 1: page = 1
            if page > total_pages: page = total_pages
            
            start_idx = (page - 1) * page_size
            end_idx = start_idx + page_size
            
            page_lines = all_lines[start_idx:end_idx]
            
            # Format as a single column dataframe-like structure
            data = [{"line_number": start_idx + i + 1, "content": line.strip()} for i, line in enumerate(page_lines)]
            
            return {
                "data": data,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_rows": total_rows,
                    "total_pages": total_pages,
                    "has_next": page < total_pages,
                    "has_prev": page > 1
                },
                "columns": ["line_number", "content"],
                "dtypes": {"line_number": "int", "content": "str"},
                "dataset_type": dataset.dataset_type
            }
            
        else:
            # Image/Audio/Video - just return metadata
            return {
                "data": [],
                "pagination": {
                    "page": 1,
                    "page_size": page_size,
                    "total_rows": 0,
                    "total_pages": 1,
                    "has_next": False,
                    "has_prev": False
                },
                "columns": [],
                "dtypes": {},
                "dataset_type": dataset.dataset_type,
                "message": f"Preview not available for {dataset.dataset_type} data"
            }

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Dataset file not found on server")
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="Dataset file is empty")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading dataset: {str(e)}")

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
