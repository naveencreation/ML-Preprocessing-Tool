"""
Test Text Preprocessing Refactor
Verifies that text data is processed using the new leak-free pipeline.
"""
import pandas as pd
import numpy as np
import os
import sys
import joblib
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services import text_preprocessing_service
from app.services.transformers import TextCleaner

def test_text_pipeline():
    print("Testing Text Pipeline...")
    
    # Create dummy text data
    df = pd.DataFrame({
        'text': [
            'This is a sample sentence.',
            'Another sample text with numbers 123.',
            'Text cleaning is important!',
            'Machine learning requires clean data.',
            'This is a test.',
            'Sample data for testing.'
        ]
    })
    
    print(f"Original Data:\n{df}")
    
    # 1. Build Pipeline
    print("\nBuilding Pipeline...")
    pipeline = text_preprocessing_service.build_text_pipeline(
        text_cleaning_method="Simple",
        stopword_removal=True,
        stemming=False,
        lemmatization=True,
        vectorization_method="TF-IDF",
        max_features=10
    )
    
    # 2. Fit on Data
    print("Fitting Pipeline...")
    pipeline.fit(df['text'])
    
    # 3. Transform
    print("Transforming...")
    vectors = pipeline.transform(df['text'])
    
    # Check output
    feature_names = pipeline.named_steps['vectorizer'].get_feature_names_out()
    print(f"Features: {feature_names}")
    
    result_df = pd.DataFrame(vectors.toarray(), columns=feature_names)
    print(f"Result:\n{result_df}")
    
    assert result_df.shape == (6, 10), f"Expected shape (6, 10), got {result_df.shape}"
    
    # 4. Test Artifact Saving/Loading
    print("\nTesting Artifact Serialization...")
    joblib.dump(pipeline, 'test_text_pipeline.pkl')
    loaded_pipeline = joblib.load('test_text_pipeline.pkl')
    
    new_text = pd.Series(['New sample text for inference.'])
    new_vectors = loaded_pipeline.transform(new_text)
    print(f"Inference Result:\n{new_vectors.toarray()}")
    
    assert new_vectors.shape == (1, 10), "Inference shape mismatch"
    
    # Cleanup
    if os.path.exists('test_text_pipeline.pkl'): os.remove('test_text_pipeline.pkl')
    
    print("\n✅ Text Pipeline Test Passed!")

if __name__ == "__main__":
    test_text_pipeline()
