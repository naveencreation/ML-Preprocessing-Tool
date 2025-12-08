"""
Test Generated Code Execution
Generates code using the service and attempts to execute it to verify validity.
"""
import pandas as pd
import numpy as np
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services import code_generator

def test_generated_code():
    print("Testing Generated Code Execution...")
    
    # Create dummy csv
    df = pd.DataFrame({
        'A': [1, 2, 3, 4, 5, np.nan],
        'B': ['x', 'y', 'x', 'y', 'z', 'x'],
        'target': [0, 1, 0, 1, 0, 1]
    })
    df.to_csv('dummy_data.csv', index=False)
    
    # Generate code
    code = code_generator.generate_preprocessing_code(
        filename='dummy_data.csv',
        missing_option='Fill with Mean',
        encoding_method='One-Hot Encoding',
        scaling_method='StandardScaler',
        train_test_split=True,
        target_column='target'
    )
    
    # Save generated code
    with open('generated_script.py', 'w') as f:
        f.write(code)
        
    print("Code generated. Executing...")
    
    try:
        # Execute the generated script
        # We use exec, but since the script imports things, we need to make sure environment is right.
        # Better to run it as a subprocess.
        import subprocess
        result = subprocess.run([sys.executable, 'generated_script.py'], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Generated script executed successfully!")
            print(result.stdout)
        else:
            print("❌ Generated script failed!")
            print(result.stderr)
            
    except Exception as e:
        print(f"❌ Execution failed: {e}")
    
    # Cleanup
    if os.path.exists('dummy_data.csv'): os.remove('dummy_data.csv')
    if os.path.exists('generated_script.py'): os.remove('generated_script.py')
    if os.path.exists('processed_train_dummy_data.csv'): os.remove('processed_train_dummy_data.csv')
    if os.path.exists('processed_test_dummy_data.csv'): os.remove('processed_test_dummy_data.csv')

if __name__ == "__main__":
    test_generated_code()
