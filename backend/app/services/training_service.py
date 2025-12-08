"""
Training Service - Supports basic ML model training on preprocessed datasets.
"""
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, mean_squared_error, r2_score, mean_absolute_error
import joblib
from typing import Dict, Any, Tuple
from app.utils.logging import get_logger

logger = get_logger(__name__)

def train_model(
    df: pd.DataFrame,
    target_column: str,
    model_type: str = "logistic_regression",
    test_size: float = 0.2,
    hyperparameters: Dict[str, Any] = None
) -> Tuple[Any, Dict[str, float]]:
    """
    Train a machine learning model on the provided dataset.
    
    Args:
        df: Preprocessed DataFrame
        target_column: Name of the target column
        model_type: Type of model to train
        test_size: Proportion for test split (if not already split)
        hyperparameters: Dict of hyperparameters for the model
    
    Returns:
        Tuple of (trained_model, metrics_dict)
    """
    if hyperparameters is None:
        hyperparameters = {}
    
    # Separate features and target
    if target_column not in df.columns:
        raise ValueError(f"Target column '{target_column}' not found in dataset")
    
    X = df.drop(columns=[target_column])
    y = df[target_column]
    
    # Determine if classification or regression
    is_classification = y.nunique() < 20 and not pd.api.types.is_float_dtype(y)
    
    # Extract CV params
    cross_validation = hyperparameters.pop('cross_validation', False)
    cv_folds = hyperparameters.pop('cv_folds', 5)

    # Select model
    if model_type == "logistic_regression":
        model = LogisticRegression(max_iter=1000, **hyperparameters)
    elif model_type == "random_forest_classifier":
        model = RandomForestClassifier(n_estimators=100, random_state=42, **hyperparameters)
    elif model_type == "decision_tree_classifier":
        model = DecisionTreeClassifier(random_state=42, **hyperparameters)
    elif model_type == "linear_regression":
        model = LinearRegression(**hyperparameters)
    elif model_type == "random_forest_regressor":
        model = RandomForestRegressor(n_estimators=100, random_state=42, **hyperparameters)
    elif model_type == "decision_tree_regressor":
        model = DecisionTreeRegressor(random_state=42, **hyperparameters)
    else:
        raise ValueError(f"Unknown model type: {model_type}")
    
    # If data is already split (Train/Test exist separately), assume this is Train only
    # For now, we'll do a simple train on all data and return metrics on training set
    # In production, you'd want to load Test separately or do cross-validation
    
    # Fit model
    model.fit(X, y)
    
    # Predict on training set (for basic metrics)
    y_pred = model.predict(X)
    
    # Calculate metrics
    metrics = {}
    if is_classification:
        metrics['accuracy'] = float(accuracy_score(y, y_pred))
        # Handle binary vs multiclass
        avg_method = 'binary' if y.nunique() == 2 else 'weighted'
        metrics['precision'] = float(precision_score(y, y_pred, average=avg_method, zero_division=0))
        metrics['recall'] = float(recall_score(y, y_pred, average=avg_method, zero_division=0))
        metrics['f1_score'] = float(f1_score(y, y_pred, average=avg_method, zero_division=0))
    else:
        metrics['mse'] = float(mean_squared_error(y, y_pred))
        metrics['rmse'] = float(np.sqrt(metrics['mse']))
        metrics['mae'] = float(mean_absolute_error(y, y_pred))
        metrics['r2_score'] = float(r2_score(y, y_pred))
        
    # --- Cross Validation ---
    # Params already extracted
    
    if cross_validation:
        from sklearn.model_selection import cross_validate
        
        scoring = []
        if is_classification:
            scoring = ['accuracy', 'precision_weighted', 'recall_weighted', 'f1_weighted']
        else:
            scoring = ['neg_mean_squared_error', 'neg_mean_absolute_error', 'r2']
            
        try:
            cv_results = cross_validate(model, X, y, cv=cv_folds, scoring=scoring)
            
            # Add CV metrics to result
            for key, values in cv_results.items():
                if key.startswith('test_'):
                    metric_name = key.replace('test_', 'cv_')
                    metrics[f'{metric_name}_mean'] = float(np.mean(values))
                    metrics[f'{metric_name}_std'] = float(np.std(values))
                    
        except Exception as e:
            logger.warning(f"Cross-validation failed: {e}")
            metrics['cv_error'] = str(e)
    
    return model, metrics

def save_model(model: Any, filepath: str) -> None:
    """Save trained model to disk."""
    joblib.dump(model, filepath)

def load_model(filepath: str) -> Any:
    """Load trained model from disk."""
    return joblib.load(filepath)
