"""
Simple inference test - Just test the core functionality
"""
import pandas as pd
import numpy as np
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services import tabular_preprocessing_service, training_service, inference_service
from app.config import settings
import joblib

print("Creating test data...")
np.random.seed(42)
df = pd.DataFrame({
    'age': [25, 35, 45, 55, 65],
    'income': [40000, 60000, 80000, 100000, 120000],'target': [0, 0, 1, 1, 1]
})

X = df.drop(columns=['target'])
y = df['target']

print("Building pipeline...")
pipeline = tabular_preprocessing_service.build_pipeline(
    X,
    missing_option="Fill with Mean",
    encoding_method="None",
    scaling_method="StandardScaler"
)
pipeline.set_output(transform="pandas")
pipeline.fit(X)

X_processed = pipeline.transform(X)
df_processed = X_processed.copy()
df_processed['target'] = y.values

print("Training model...")
model, metrics = training_service.train_model(
    df=df_processed,
    target_column='target',
    model_type='logistic_regression'
)
print(f"Metrics: {metrics}")

print("Saving artifacts...")
settings.create_directories()
pipeline_path = settings.ARTIFACTS_DIR / "simple_test_pipeline.pkl"
model_path = settings.ARTIFACTS_DIR / "simple_test_model.pkl"
joblib.dump(pipeline, pipeline_path)
joblib.dump(model, model_path)

print("Testing inference...")
new_data = {'age': 40, 'income': 70000}
predictions = inference_service.predict(
    pipeline_path=str(pipeline_path),
    model_path=str(model_path),
    data=new_data
)
print(f"✅ Prediction: {predictions}")

# Cleanup
os.remove(pipeline_path)
os.remove(model_path)
print("✅ TEST PASSED!")
