from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
from app.database import get_db
from app import models
from app.services import eda_service

router = APIRouter(
    prefix="/eda",
    tags=["eda"]
)

def get_dataframe(dataset_id: int, db: Session):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        return pd.read_csv(dataset.filepath)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

@router.get("/{dataset_id}/stats")
def get_stats(dataset_id: int, db: Session = Depends(get_db)):
    df = get_dataframe(dataset_id, db)
    return {
        "basic_info": eda_service.get_basic_info(df),
        "summary": eda_service.get_summary_statistics(df),
        "missing": eda_service.get_missing_values(df),
        "categorical": eda_service.get_categorical_uniques(df)
    }

@router.get("/{dataset_id}/histogram")
def get_histogram(dataset_id: int, column: str, db: Session = Depends(get_db)):
    df = get_dataframe(dataset_id, db)
    if column not in df.columns:
        raise HTTPException(status_code=400, detail="Column not found")
    return eda_service.generate_histogram(df, column)

@router.get("/{dataset_id}/boxplot")
def get_boxplot(dataset_id: int, column: str, db: Session = Depends(get_db)):
    df = get_dataframe(dataset_id, db)
    if column not in df.columns:
        raise HTTPException(status_code=400, detail="Column not found")
    return eda_service.generate_boxplot(df, column)

@router.get("/{dataset_id}/correlation")
def get_correlation(dataset_id: int, db: Session = Depends(get_db)):
    df = get_dataframe(dataset_id, db)
    return eda_service.generate_correlation_matrix(df)

@router.get("/{dataset_id}/quality-report")
def get_quality_report(dataset_id: int, db: Session = Depends(get_db)):
    df = get_dataframe(dataset_id, db)
    return eda_service.get_quality_report(df)
