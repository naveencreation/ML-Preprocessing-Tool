"""
Inference Router - API endpoints for making predictions with trained models.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Union
from pydantic import BaseModel
from app.database import get_db
from app import models
from app.services import inference_service

router = APIRouter(
    prefix="/inference",
    tags=["inference"]
)

class InferenceRequest(BaseModel):
    """Request body for inference endpoint."""
    dataset_id: int  # The dataset that was used for training
    data: Union[Dict[str, Any], List[Dict[str, Any]]]  # New data to predict on
    use_probabilities: bool = False  # Return probabilities instead of predictions

@router.post("/predict")
def predict(
    request: InferenceRequest,
    db: Session = Depends(get_db)
):
    """
    Make predictions on new data using a trained model.
    
    The endpoint will:
    1. Find the preprocessing pipeline used for this dataset
    2. Find the most recent trained model for this dataset
    3. Apply preprocessing to new data
    4. Make predictions
    
    Args:
        request: InferenceRequest containing dataset_id and new data
    """
    # 1. Find preprocessing pipeline artifact
    preprocessing_log = db.query(models.ProcessingLog).filter(
        models.ProcessingLog.dataset_id == request.dataset_id,
        models.ProcessingLog.action == "preprocessing_split_v2"
    ).order_by(models.ProcessingLog.created_at.desc()).first()
    
    if not preprocessing_log or "artifact_path" not in preprocessing_log.parameters:
        raise HTTPException(
            status_code=404, 
            detail="No preprocessing pipeline found for this dataset. Make sure the dataset was processed with the new pipeline system."
        )
    
    pipeline_path = preprocessing_log.parameters["artifact_path"]
    
    # 2. Find trained model artifact
    training_log = db.query(models.ProcessingLog).filter(
        models.ProcessingLog.dataset_id == request.dataset_id,
        models.ProcessingLog.action == "model_training"
    ).order_by(models.ProcessingLog.created_at.desc()).first()
    
    if not training_log or "model_path" not in training_log.parameters:
        raise HTTPException(
            status_code=404,
            detail="No trained model found for this dataset. Train a model first using POST /training/{dataset_id}/train"
        )
    
    model_path = training_log.parameters["model_path"]
    model_type = training_log.parameters.get("model_type", "unknown")
    
    # 3. Make predictions
    try:
        if request.use_probabilities:
            predictions = inference_service.predict_proba(
                pipeline_path=pipeline_path,
                model_path=model_path,
                data=request.data
            )
            return {
                "predictions": predictions,
                "model_type": model_type,
                "prediction_type": "probabilities"
            }
        else:
            predictions = inference_service.predict(
                pipeline_path=pipeline_path,
                model_path=model_path,
                data=request.data
            )
            return {
                "predictions": predictions,
                "model_type": model_type,
                "prediction_type": "class" if "classifier" in model_type else "value"
            }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@router.get("/{dataset_id}/info")
def get_inference_info(dataset_id: int, db: Session = Depends(get_db)):
    """
    Get information about available models and pipelines for a dataset.
    Useful for checking if inference is possible.
    """
    # Find preprocessing pipeline
    preprocessing_log = db.query(models.ProcessingLog).filter(
        models.ProcessingLog.dataset_id == dataset_id,
        models.ProcessingLog.action == "preprocessing_split_v2"
    ).order_by(models.ProcessingLog.created_at.desc()).first()
    
    # Find all trained models
    training_logs = db.query(models.ProcessingLog).filter(
        models.ProcessingLog.dataset_id == dataset_id,
        models.ProcessingLog.action == "model_training"
    ).order_by(models.ProcessingLog.created_at.desc()).all()
    
    return {
        "dataset_id": dataset_id,
        "has_pipeline": preprocessing_log is not None,
        "pipeline_info": preprocessing_log.parameters if preprocessing_log else None,
        "trained_models_count": len(training_logs),
        "trained_models": [
            {
                "model_type": log.parameters.get("model_type"),
                "metrics": log.parameters.get("metrics"),
                "created_at": log.created_at.isoformat()
            }
            for log in training_logs
        ] if training_logs else []
    }
