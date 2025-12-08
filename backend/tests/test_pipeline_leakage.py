import pandas as pd
import numpy as np
from app.services.tabular_preprocessing_service import build_pipeline, clean_data
from sklearn.model_selection import train_test_split

def test_leakage_fix():
    print("Testing Data Leakage Fix...")
    
    # 1. Create Synthetic Data with clear differences
    # Train: Mean = 10
    # Test: Mean = 100
    # If leakage exists, the imputer/scaler will be affected by the 100.
    
    df_train = pd.DataFrame({'val': [9, 10, 11, np.nan]}) # Mean of knowns = 10
    df_test = pd.DataFrame({'val': [99, 100, 101, np.nan]}) # Mean of knowns = 100
    
    # Combine for simulation of "Old Way" (loading all then splitting)
    df_all = pd.concat([df_train, df_test]).reset_index(drop=True)
    
    print(f"Train Mean (Expected): 10.0")
    print(f"Test Mean (Expected): 100.0")
    print(f"Combined Mean: {df_all['val'].mean()}")
    
    # --- Test 1: Imputation Leakage ---
    print("\n--- Test 1: Imputation ---")
    
    # Build Pipeline
    pipeline = build_pipeline(
        df_train,
        missing_option="Fill with Mean",
        encoding_method="None",
        scaling_method="None"
    )
    pipeline.set_output(transform="pandas")
    
    # Fit on TRAIN ONLY
    pipeline.fit(df_train)
    
    # Transform Test
    test_processed = pipeline.transform(df_test)
    
    print(f"Processed Columns: {test_processed.columns.tolist()}")
    
    # Check what NaN was filled with in Test
    # ColumnTransformer prefixes names with step name (e.g., 'num__val')
    val_col = [c for c in test_processed.columns if 'val' in c][0]
    filled_val = test_processed.iloc[3][val_col]
    print(f"NaN in Test filled with: {filled_val}")
    
    if abs(filled_val - 10.0) < 0.1:
        print("✅ PASS: Test NaN filled with TRAIN mean (10.0). No leakage.")
    elif abs(filled_val - 55.0) < 5.0: # Approx combined mean
        print("❌ FAIL: Test NaN filled with COMBINED mean. LEAKAGE DETECTED.")
    else:
        print(f"❌ FAIL: Test NaN filled with unexpected value: {filled_val}")

    # --- Test 2: Scaling Leakage ---
    print("\n--- Test 2: Scaling ---")
    
    pipeline_scale = build_pipeline(
        df_train,
        missing_option="Fill with Mean",
        encoding_method="None",
        scaling_method="StandardScaler"
    )
    pipeline_scale.set_output(transform="pandas")
    
    pipeline_scale.fit(df_train)
    
    # Transform Test
    # If scaled correctly using Train stats:
    # Train mean=10, std=~0.81
    # Test val 100 should be (100-10)/0.81 = ~111
    
    test_scaled = pipeline_scale.transform(df_test)
    val_col = [c for c in test_scaled.columns if 'val' in c][0]
    val_100_scaled = test_scaled.iloc[1][val_col]
    
    print(f"Value 100 scaled to: {val_100_scaled}")
    
    if val_100_scaled > 50:
        print("✅ PASS: Test value scaled using TRAIN stats (High Z-score). No leakage.")
    else:
        print("❌ FAIL: Test value scaled using COMBINED/TEST stats (Low Z-score). LEAKAGE DETECTED.")

if __name__ == "__main__":
    test_leakage_fix()
