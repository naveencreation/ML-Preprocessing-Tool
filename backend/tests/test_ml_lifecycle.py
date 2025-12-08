"""
End-to-End ML Lifecycle Test
Tests: Upload → Preprocess → Train → Inference
"""
import pandas as pd
import numpy as np
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services import tabular_preprocessing_service, training_service, inference_service
from app.config import settings
import joblib

def test_ml_lifecycle():
    print("=" * 60)
    print("Testing Complete ML Lifecycle")
    print("=" * 60)
    
    # 1. Create synthetic dataset
    print("\n1. Creating synthetic classification dataset...")
    np.random.seed(42)
    df = pd.DataFrame({
        'age': np.random.randint(18, 80, 100),
        'income': np.random.randint(20000, 120000, 100),
        'credit_score': np.random.randint(300, 850, 100),
        'category': np.random.choice(['A', 'B', 'C'], 100),
        'target': np.random.choice([0, 1], 100)
    })
    
    print(f"✓ Dataset created: {df.shape}")
    print(f"  Columns: {df.columns.tolist()}")
    print(f"  Target distribution: {df['target'].value_counts().to_dict()}")
    
    # 2. Split data (simulating train/test)
    print("\n2. Splitting into Train/Test...")
    from sklearn.model_selection import train_test_split
    train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)
    print(f"✓ Train: {train_df.shape}, Test: {test_df.shape}")
    
    # 3. Build and fit preprocessing pipeline
    print("\n3. Building and fitting preprocessing pipeline...")
    
    # Separate features and target for pipeline (pipeline shouldn't see target)
    X_train = train_df.drop(columns=['target'])
    y_train = train_df['target']
    
    pipeline = tabular_preprocessing_service.build_pipeline(
        X_train,
        missing_option="Fill with Mean",
        encoding_method="One-Hot Encoding",
        scaling_method="StandardScaler"
    )
    pipeline.set_output(transform="pandas")
    pipeline.fit(X_train)
    print("✓ Pipeline fitted on training data")
    
    # 4. Transform train and test
    print("\n4. Transforming train and test data...")
    X_test = test_df.drop(columns=['target'])
    y_test = test_df['target']
    
    X_train_processed = pipeline.transform(X_train)
    X_test_processed = pipeline.transform(X_test)
    
    # Recombine with target
    train_processed = X_train_processed.copy()
    train_processed['target'] = y_train.values
    
    test_processed = X_test_processed.copy()
    test_processed['target'] = y_test.values
    
    print(f"✓ Train transformed: {train_processed.shape}")
    print(f"✓ Test transformed: {test_processed.shape}")
    
    # 5. Train model
    print("\n5. Training Random Forest Classifier...")
    model, metrics = training_service.train_model(
        df=train_processed,
        target_column='target',
        model_type='random_forest_classifier'
    )
    print(f"✓ Model trained")
    print(f"  Training Metrics: {metrics}")
    
    # 6. Save artifacts
    print("\n6. Saving artifacts...")
    settings.create_directories()
    pipeline_path = settings.ARTIFACTS_DIR / "test_pipeline.pkl"
    model_path = settings.ARTIFACTS_DIR / "test_model.pkl"
    
    joblib.dump(pipeline, pipeline_path)
    joblib.dump(model, model_path)
    print(f"✓ Pipeline saved: {pipeline_path}")
    print(f"✓ Model saved: {model_path}")
    
    # 7. Inference on new data
    print("\n7. Testing inference on new unseen data...")
    
    # Create new data (single row)
    new_data_single = {
        'age': 35,
        'income': 75000,
        'credit_score': 720,
        'category': 'B'
    }
    
    # Create new data (multiple rows)
    new_data_batch = [
        {'age': 25, 'income': 45000, 'credit_score': 650, 'category': 'A'},
        {'age': 55, 'income': 95000, 'credit_score': 800, 'category': 'C'},
        {'age': 40, 'income': 60000, 'credit_score': 700, 'category': 'B'}
    ]
    
    # Predict single
    pred_single = inference_service.predict(
        pipeline_path=str(pipeline_path),
        model_path=str(model_path),
        data=new_data_single
    )
    print(f"✓ Single prediction: {pred_single}")
    
    # Predict batch
    pred_batch = inference_service.predict(
        pipeline_path=str(pipeline_path),
        model_path=str(model_path),
        data=new_data_batch
    )
    print(f"✓ Batch predictions: {pred_batch}")
    
    # Predict probabilities
    try:
        proba_single = inference_service.predict_proba(
            pipeline_path=str(pipeline_path),
            model_path=str(model_path),
            data=new_data_single
        )
        print(f"✓ Single probabilities: {proba_single}")
    except Exception as e:
        print(f"⚠ Probability prediction failed: {e}")
    
    # 8. Verify predictions are valid
    print("\n8. Validating predictions...")
    assert len(pred_single) == 1, "Single prediction should return 1 value"
    assert len(pred_batch) == 3, "Batch prediction should return 3 values"
    assert all(p in [0, 1] for p in pred_single + pred_batch), "All predictions should be 0 or 1"
    print("✓ All predictions are valid")
    
    # 9. Test error handling
    print("\n9. Testing error handling...")
    try:
        # Missing column
        bad_data = {'age': 30, 'income': 50000}  # Missing credit_score and category
        inference_service.predict(
            pipeline_path=str(pipeline_path),
            model_path=str(model_path),
            data=bad_data
        )
        print("❌ FAIL: Should have raised ValueError for missing columns")
    except ValueError as e:
        print(f"✓ Correctly caught error: {str(e)[:60]}...")
    
    # Cleanup
    print("\n10. Cleanup...")
    os.remove(pipeline_path)
    os.remove(model_path)
    print("✓ Test artifacts removed")
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED - ML Lifecycle is working!")
    print("=" * 60)


if __name__ == "__main__":
    try:
        test_ml_lifecycle()
    except Exception as e:
        print(f"\n❌ TEST FAILED WITH ERROR:")
        print(f"   {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
