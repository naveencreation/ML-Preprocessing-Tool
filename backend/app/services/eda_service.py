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
