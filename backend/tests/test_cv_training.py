"""
Test Cross-Validation Training
Verifies that the training service correctly performs cross-validation.
"""
import pandas as pd
import numpy as np
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services import training_service

def test_cv_training():
    print("Testing Cross-Validation Training...")
    
    # Create dummy classification data
    df = pd.DataFrame({
        'feature1': np.random.rand(100),
        'feature2': np.random.rand(100),
        'target': np.random.randint(0, 2, 100)
    })
    
    print(f"Data Shape: {df.shape}")
    
    # Train with CV
    print("\nTraining Logistic Regression with CV=5...")
    model, metrics = training_service.train_model(
        df=df,
        target_column='target',
        model_type='logistic_regression',
        hyperparameters={'cross_validation': True, 'cv_folds': 5}
    )
    
    print("\nMetrics:")
    for k, v in metrics.items():
        print(f"{k}: {v}")
        
    # Verify CV metrics exist
    assert 'cv_accuracy_mean' in metrics, "CV Accuracy Mean missing"
    assert 'cv_f1_weighted_mean' in metrics, "CV F1 Mean missing"
    
    print("\n✅ CV Training Test Passed!")

if __name__ == "__main__":
    test_cv_training()
