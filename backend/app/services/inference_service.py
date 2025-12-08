"""
Inference Service - Load artifacts and make predictions on new data.
"""
import pandas as pd
import joblib
from typing import Dict, Any, List, Union
import os

def predict(
    pipeline_path: str,
    model_path: str,
    data: Union[Dict[str, Any], List[Dict[str, Any]]]
) -> List[Any]:
    """
    Make predictions on new data using saved pipeline and model.
    
    Args:
        pipeline_path: Path to saved preprocessing pipeline (.pkl)
        model_path: Path to saved trained model (.pkl)
        data: New data as dict (single row) or list of dicts (multiple rows)
    
    Returns:
        List of predictions
    """
    # Validate paths
    if not os.path.exists(pipeline_path):
        raise FileNotFoundError(f"Pipeline not found: {pipeline_path}")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")
    
    # Load artifacts
    pipeline = joblib.load(pipeline_path)
    model = joblib.load(model_path)
    
    # Convert data to DataFrame
    if isinstance(data, dict):
        df = pd.DataFrame([data])
    else:
        df = pd.DataFrame(data)
    
    # Transform using pipeline
    try:
        df_transformed = pipeline.transform(df)
    except Exception as e:
        raise ValueError(f"Preprocessing failed: {str(e)}. Make sure input data has the same structure as training data.")
    
    # Make predictions
    try:
        predictions = model.predict(df_transformed)
    except Exception as e:
        raise ValueError(f"Prediction failed: {str(e)}")
    
    # Return as list
    return predictions.tolist()

def predict_proba(
    pipeline_path: str,
    model_path: str,
    data: Union[Dict[str, Any], List[Dict[str, Any]]]
) -> List[List[float]]:
    """
    Make probability predictions (for classifiers that support it).
    
    Args:
        pipeline_path: Path to saved preprocessing pipeline (.pkl)
        model_path: Path to saved trained model (.pkl)
        data: New data as dict (single row) or list of dicts (multiple rows)
    
    Returns:
        List of probability arrays
    """
    # Validate paths
    if not os.path.exists(pipeline_path):
        raise FileNotFoundError(f"Pipeline not found: {pipeline_path}")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")
    
    # Load artifacts
    pipeline = joblib.load(pipeline_path)
    model = joblib.load(model_path)
    
    # Check if model supports predict_proba
    if not hasattr(model, 'predict_proba'):
        raise ValueError("Model does not support probability predictions")
    
    # Convert data to DataFrame
    if isinstance(data, dict):
        df = pd.DataFrame([data])
    else:
        df = pd.DataFrame(data)
    
    # Transform using pipeline
    df_transformed = pipeline.transform(df)
    
    # Make predictions
    probabilities = model.predict_proba(df_transformed)
    
    return probabilities.tolist()
