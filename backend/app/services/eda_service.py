import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import json

def get_basic_info(df: pd.DataFrame):
    buffer = pd.DataFrame({
        'Column': df.columns,
        'Type': df.dtypes.astype(str),
        'Non-Null Count': df.count(),
        'Null Count': df.isnull().sum()
    }).reset_index(drop=True)
    return buffer.to_dict(orient='records')

def get_summary_statistics(df: pd.DataFrame):
    return df.describe().reset_index().to_dict(orient='records')

def get_missing_values(df: pd.DataFrame):
    missing = df.isnull().sum()
    missing = missing[missing > 0]
    return missing.to_dict()

def get_categorical_uniques(df: pd.DataFrame):
    categorical_columns = df.select_dtypes(include=['object']).columns
    uniques = {}
    for col in categorical_columns:
        uniques[col] = {
            'count': int(df[col].nunique()),
            'values': df[col].unique().tolist()[:50] # Limit to 50 for performance
        }
    return uniques

def generate_histogram(df: pd.DataFrame, column: str):
    fig = px.histogram(df, x=column, nbins=30, title=f'Interactive Histogram for {column}')
    return json.loads(fig.to_json())

def generate_boxplot(df: pd.DataFrame, column: str):
    fig = px.box(df, y=column, title=f'Interactive Boxplot for {column}')
    return json.loads(fig.to_json())

def generate_correlation_matrix(df: pd.DataFrame):
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.empty:
        return None
    correlation_matrix = numeric_df.corr()
    fig = px.imshow(correlation_matrix, title="Interactive Correlation Matrix", color_continuous_scale="RdBu", aspect="auto")
    return json.loads(fig.to_json())

def get_quality_report(df: pd.DataFrame):
    """
    Generates a comprehensive data quality report.
    """
    # 1. Duplicates
    duplicate_count = df.duplicated().sum()
    duplicate_percent = (duplicate_count / len(df)) * 100 if len(df) > 0 else 0
    
    # 2. Missing Values
    missing_counts = df.isnull().sum()
    missing_total = missing_counts.sum()
    missing_percent = (missing_total / (len(df) * len(df.columns))) * 100 if len(df) > 0 else 0
    
    # 3. Outliers (IQR method for numeric columns)
    outliers = {}
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    total_outliers = 0
    
    for col in numeric_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        col_outliers = ((df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))).sum()
        if col_outliers > 0:
            outliers[col] = int(col_outliers)
            total_outliers += col_outliers
            
    # 4. Memory Usage
    memory_usage = df.memory_usage(deep=True).sum()
    
    return {
        "rows": len(df),
        "columns": len(df.columns),
        "duplicates": {
            "count": int(duplicate_count),
            "percentage": round(duplicate_percent, 2)
        },
        "missing": {
            "total": int(missing_total),
            "percentage": round(missing_percent, 2),
            "by_column": missing_counts[missing_counts > 0].to_dict()
        },
        "outliers": {
            "total": int(total_outliers),
            "by_column": outliers
        },
        "memory_usage_bytes": int(memory_usage)
    }
