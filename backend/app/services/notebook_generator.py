"""
Notebook generator service for exporting preprocessing pipelines as Jupyter notebooks.
"""
import json
from datetime import datetime
from typing import Dict, Any

def generate_notebook(dataset_filename: str, preprocessing_config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate a Jupyter notebook (.ipynb) containing:
    - Data loading code
    - Preprocessing pipeline code
    - Basic EDA visualizations
    
    Args:
        dataset_filename: Name of the dataset file
        preprocessing_config: Preprocessing configuration dictionary
    
    Returns:
        Notebook dictionary in Jupyter format
    """
    
    cells = []
    
    # Cell 1: Title and Description
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            f"# ML Preprocessing Pipeline\\n",
            f"\\n",
            f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\\n",
            f"**Dataset:** {dataset_filename}\\n",
            f"\\n",
            f"This notebook was automatically generated from the ML Preprocessing Tool.\\n",
            f"It contains the exact preprocessing steps configured in the tool."
        ]
    })
    
    # Cell 2: Imports
    imports = [
        "import pandas as pd\\n",
        "import numpy as np\\n",
        "import matplotlib.pyplot as plt\\n",
        "import seaborn as sns\\n",
        "from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, LabelEncoder\\n",
        "from sklearn.model_selection import train_test_split\\n",
        "\\n",
        "# Configure visualization style\\n",
        "plt.style.use('seaborn-v0_8-darkgrid')\\n",
        "sns.set_palette('husl')\\n",
        "%matplotlib inline"
    ]
    
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": imports
    })
    
    # Cell 3: Load Data
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["## 1. Load Data"]
    })
    
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            f"# Load the dataset\\n",
            f"df = pd.read_csv('{dataset_filename}')\\n",
            f"\\n",
            f"print(f'Dataset shape: {{df.shape}}')\\n",
            f"print(f'Columns: {{df.columns.tolist()}}')\\n",
            f"df.head()"
        ]
    })
    
    # Cell 4: Data Cleaning
    if preprocessing_config.get('remove_duplicates') or preprocessing_config.get('standardize_text'):
        cells.append({
            "cell_type": "markdown",
            "metadata": {},
            "source": ["## 2. Data Cleaning"]
        })
        
        cleaning_code = []
        if preprocessing_config.get('remove_duplicates'):
            cleaning_code.extend([
                "# Remove duplicate rows\\n",
                "print(f'Rows before: {len(df)}')\\n",
                "df = df.drop_duplicates()\\n",
                "print(f'Rows after: {len(df)}')\\n",
                "\\n"
            ])
        
        if preprocessing_config.get('standardize_text'):
            cleaning_code.extend([
                "# Standardize text columns (lowercase, trim)\\n",
                "for col in df.select_dtypes(include=['object']).columns:\\n",
                "    df[col] = df[col].str.lower().str.strip()\\n",
                "\\n"
            ])
        
        cells.append({
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": cleaning_code
        })
    
    # Cell 5: Handle Missing Values
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["## 3. Handle Missing Values"]
    })
    
    missing_option = preprocessing_config.get('missing_option', 'Drop Rows')
    missing_code = []
    
    if missing_option == "Drop Rows":
        missing_code = [
            "# Drop rows with missing values\\n",
            "print(f'Missing values before: {df.isnull().sum().sum()}')\\n",
            "df = df.dropna()\\n",
            "print(f'Rows after: {len(df)}')"
        ]
    elif missing_option == "Fill with Mean":
        missing_code = [
            "# Fill missing values with column mean\\n",
            "for col in df.select_dtypes(include=[np.number]).columns:\\n",
            "    df[col].fillna(df[col].mean(), inplace=True)"
        ]
    elif missing_option == "Fill with Median":
        missing_code = [
            "# Fill missing values with column median\\n",
            "for col in df.select_dtypes(include=[np.number]).columns:\\n",
            "    df[col].fillna(df[col].median(), inplace=True)"
        ]
    
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": missing_code
    })
    
    # Cell 6: Encoding
    encoding_method = preprocessing_config.get('encoding_method', 'None')
    if encoding_method != 'None':
        cells.append({
            "cell_type": "markdown",
            "metadata": {},
            "source": ["## 4. Encode Categorical Variables"]
        })
        
        if encoding_method == "Label Encoding":
            cells.append({
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Label Encoding for categorical columns\\n",
                    "label_encoders = {}\\n",
                    "for col in df.select_dtypes(include=['object']).columns:\\n",
                    "    le = LabelEncoder()\\n",
                    "    df[col] = le.fit_transform(df[col].astype(str))\\n",
                    "    label_encoders[col] = le\\n",
                    "\\n",
                    "print(f'Encoded {len(label_encoders)} columns')"
                ]
            })
        elif encoding_method == "One-Hot Encoding":
            cells.append({
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# One-Hot Encoding\\n",
                    "df = pd.get_dummies(df, drop_first=True)\\n",
                    "print(f'Shape after encoding: {df.shape}')"
                ]
            })
    
    # Cell 7: Scaling
    scaling_method = preprocessing_config.get('scaling_method', 'None')
    if scaling_method != 'None':
        cells.append({
            "cell_type": "markdown",
            "metadata": {},
            "source": ["## 5. Feature Scaling"]
        })
        
        scaler_map = {
            "StandardScaler": "StandardScaler()",
            "MinMaxScaler": "MinMaxScaler()",
            "RobustScaler": "RobustScaler()"
        }
        
        scaler_code = scaler_map.get(scaling_method, "StandardScaler()")
        
        cells.append({
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                f"# Apply {scaling_method}\\n",
                f"scaler = {scaler_code}\\n",
                f"numeric_cols = df.select_dtypes(include=[np.number]).columns\\n",
                f"df[numeric_cols] = scaler.fit_transform(df[numeric_cols])\\n",
                f"\\n",
                f"print(f'Scaled {{len(numeric_cols)}} numeric columns')"
            ]
        })
    
    # Cell 8: Train/Test Split
    if preprocessing_config.get('train_test_split'):
        cells.append({
            "cell_type": "markdown",
            "metadata": {},
            "source": ["## 6. Train/Test Split"]
        })
        
        target_col = preprocessing_config.get('target_column', '')
        test_size = preprocessing_config.get('test_size', 0.2)
        
        if target_col:
            cells.append({
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    f"# Separate features and target\\n",
                    f"X = df.drop('{target_col}', axis=1)\\n",
                    f"y = df['{target_col}']\\n",
                    f"\\n",
                    f"# Split into train and test sets\\n",
                    f"X_train, X_test, y_train, y_test = train_test_split(\\n",
                    f"    X, y, test_size={test_size}, random_state=42\\n",
                    f")\\n",
                    f"\\n",
                    f"print(f'Train set size: {{len(X_train)}}')\\n",
                    f"print(f'Test set size: {{len(X_test)}}')"
                ]
            })
    
    # Cell 9: Basic EDA
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["## 7. Basic Exploratory Data Analysis"]
    })
    
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "# Descriptive statistics\\n",
            "df.describe()"
        ]
    })
    
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "# Correlation heatmap (for numeric columns)\\n",
            "numeric_df = df.select_dtypes(include=[np.number])\\n",
            "if len(numeric_df.columns) > 1:\\n",
            "    plt.figure(figsize=(10, 8))\\n",
            "    sns.heatmap(numeric_df.corr(), annot=True, cmap='coolwarm', center=0)\\n",
            "    plt.title('Correlation Matrix')\\n",
            "    plt.tight_layout()\\n",
            "    plt.show()"
        ]
    })
    
    # Notebook metadata
    notebook = {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "codemirror_mode": {
                    "name": "ipython",
                    "version": 3
                },
                "file_extension": ".py",
                "mimetype": "text/x-python",
                "name": "python",
                "nbconvert_exporter": "python",
                "pygments_lexer": "ipython3",
                "version": "3.8.0"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }
    
    return notebook
