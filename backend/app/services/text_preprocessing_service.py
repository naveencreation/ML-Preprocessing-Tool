import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from app.services.transformers import TextCleaner

def clean_text_data(df: pd.DataFrame, text_column: str = None) -> pd.DataFrame:
    """
    Basic row-wise cleaning for text data.
    Currently just ensures the text column exists and is string.
    Actual text processing happens in the pipeline.
    """
    df = df.copy()
    
    # Identify text column
    if not text_column:
        object_cols = df.select_dtypes(include=['object']).columns
        if not object_cols.empty:
            text_column = object_cols[0]
        else:
            return df
            
    if text_column not in df.columns:
        return df

    # Ensure column is string
    df[text_column] = df[text_column].astype(str)
    
    return df

def build_text_pipeline(
    text_cleaning_method: str = "None",
    stopword_removal: bool = False,
    stemming: bool = False,
    lemmatization: bool = False,
    vectorization_method: str = "None",
    max_features: int = 1000
) -> Pipeline:
    """
    Builds a scikit-learn pipeline for text processing.
    """
    steps = []
    
    # 1. Text Cleaning (Custom Transformer)
    if text_cleaning_method != "None" or stopword_removal or stemming or lemmatization:
        steps.append(('cleaner', TextCleaner(
            cleaning_method=text_cleaning_method,
            stopword_removal=stopword_removal,
            stemming=stemming,
            lemmatization=lemmatization
        )))
        
    # 2. Vectorization
    if vectorization_method == "TF-IDF":
        steps.append(('vectorizer', TfidfVectorizer(max_features=max_features)))
    elif vectorization_method == "Count":
        steps.append(('vectorizer', CountVectorizer(max_features=max_features)))
        
    return Pipeline(steps)
