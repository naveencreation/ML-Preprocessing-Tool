"""
Training Router - API endpoints for model training.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import os
from app.database import get_db
from app import models, schemas
from app.services import training_service
from app.config import settings

router = APIRouter(
    prefix="/training",
    tags=["training"]
)

@router.post("/{dataset_id}/train")
def train_model(
    dataset_id: int,
    options: schemas.TrainingOptions,
    db: Session = Depends(get_db)
):
    """
    Train a machine learning model on a processed dataset.
    """
    # Fetch dataset
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Verify it's a processed dataset
    if "Processed" not in dataset.status:
        raise HTTPException(status_code=400, detail="Dataset must be processed before training")
    
    # Load data
    try:
        df = pd.read_csv(dataset.filepath)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading dataset: {str(e)}")
    
    # Train model
    try:
        hyperparameters = options.hyperparameters if options.hyperparameters else {}
        hyperparameters['cross_validation'] = options.cross_validation
        hyperparameters['cv_folds'] = options.cv_folds
        
        model, metrics = training_service.train_model(
            df=df,
            target_column=options.target_column,
            model_type=options.model_type,
            test_size=options.test_size,
            hyperparameters=hyperparameters
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")
    
    # Save model
    import time
    timestamp = int(time.time())
    model_filename = f"model_{options.model_type}_{timestamp}_{dataset_id}.pkl"
    model_filepath = settings.ARTIFACTS_DIR / model_filename
    
    training_service.save_model(model, str(model_filepath))
    
    # Log training
    log = models.ProcessingLog(
        dataset_id=dataset_id,
        action="model_training",
        parameters={
            "model_type": options.model_type,
            "target_column": options.target_column,
            "model_path": str(model_filepath),
            "metrics": metrics,
            "cv": options.cross_validation
        }
    )
    db.add(log)
    db.commit()
    
    return {
        "status": "success",
        "model_type": options.model_type,
        "model_path": str(model_filepath),
        "metrics": metrics
    }

@router.get("/{dataset_id}/models")
def get_trained_models(dataset_id: int, db: Session = Depends(get_db)):
    """Get all models trained on a specific dataset."""
    logs = db.query(models.ProcessingLog).filter(
        models.ProcessingLog.dataset_id == dataset_id,
        models.ProcessingLog.action == "model_training"
    ).all()
    
    return [log.parameters for log in logs]
