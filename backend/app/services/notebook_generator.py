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
    - Leak-free Preprocessing pipeline code (Split -> Fit -> Transform)
    - Basic EDA visualizations
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
            f"It implements a **leak-free** machine learning pipeline using Scikit-Learn."
        ]
    })
    
    # Cell 2: Imports
    imports = [
        "import pandas as pd\\n",
        "import numpy as np\\n",
        "import matplotlib.pyplot as plt\\n",
        "import seaborn as sns\\n",
        "from sklearn.model_selection import train_test_split\\n",
        "from sklearn.pipeline import Pipeline\\n",
        "from sklearn.compose import ColumnTransformer\\n",
        "from sklearn.impute import SimpleImputer, KNNImputer\\n",
        "from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, OneHotEncoder, OrdinalEncoder\\n",
        "from scipy import stats\\n",
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
            f"df.head()"
        ]
    })
    
    # Cell 4: Initial Cleaning
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["## 2. Initial Cleaning (Safe row-wise operations)"]
    })
    
    cleaning_code = []
    if preprocessing_config.get('remove_duplicates'):
        cleaning_code.extend([
            "# Remove duplicate rows\\n",
            "df = df.drop_duplicates()\\n"
        ])
    
    if preprocessing_config.get('standardize_text'):
        cleaning_code.extend([
            "# Standardize text columns\\n",
            "for col in df.select_dtypes(include=['object']).columns:\\n",
            "    df[col] = df[col].str.lower().str.strip()\\n"
        ])
        
    if not cleaning_code:
        cleaning_code = ["# No initial cleaning steps configured"]
        
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": cleaning_code
    })
    
    # Cell 5: Train/Test Split
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["## 3. Train/Test Split\\n", "Crucial: Split BEFORE imputation/scaling to prevent data leakage."]
    })
    
    target_col = preprocessing_config.get('target_column')
    test_size = preprocessing_config.get('test_size', 0.2)
    stratify = preprocessing_config.get('stratify', False)
    
    split_code = []
    if target_col:
        split_code.extend([
            f"X = df.drop(columns=['{target_col}'])\\n",
            f"y = df['{target_col}']\\n",
            "\\n",
            f"X_train, X_test, y_train, y_test = train_test_split(\\n",
            f"    X, y, test_size={test_size}, stratify={'y' if stratify else 'None'}, random_state=42\\n",
            ")"
        ])
    else:
        split_code.extend([
            "X = df.copy()\\n",
            "y = None\\n",
            "\\n",
            f"X_train, X_test, y_train, y_test = train_test_split(\\n",
            f"    X, y, test_size={test_size}, random_state=42\\n",
            ")"
        ])
        
    split_code.append(f"\\nprint(f'Train shape: {{X_train.shape}}, Test shape: {{X_test.shape}}')")
    
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": split_code
    })
    
    # Cell 6: Outlier Removal (Train Only)
    outlier_method = preprocessing_config.get('outlier_method', 'None')
    if outlier_method != 'None':
        cells.append({
            "cell_type": "markdown",
            "metadata": {},
            "source": ["## 4. Outlier Removal (Train Only)"]
        })
        
        outlier_code = [
            "numeric_cols = X_train.select_dtypes(include=np.number).columns\\n"
        ]
        
        if outlier_method == "Z-Score":
            outlier_code.extend([
                "z_scores = np.abs(stats.zscore(X_train[numeric_cols].fillna(0)))\\n",
                "mask = (z_scores < 3).all(axis=1)\\n",
                "X_train = X_train[mask]\\n",
                "if y_train is not None: y_train = y_train[mask]\\n",
                "print(f'Train shape after outlier removal: {X_train.shape}')"
            ])
        elif outlier_method == "IQR":
            outlier_code.extend([
                "Q1 = X_train[numeric_cols].quantile(0.25)\\n",
                "Q3 = X_train[numeric_cols].quantile(0.75)\\n",
                "IQR = Q3 - Q1\\n",
                "mask = ~((X_train[numeric_cols] < (Q1 - 1.5 * IQR)) | (X_train[numeric_cols] > (Q3 + 1.5 * IQR))).any(axis=1)\\n",
                "X_train = X_train[mask]\\n",
                "if y_train is not None: y_train = y_train[mask]\\n",
                "print(f'Train shape after outlier removal: {X_train.shape}')"
            ])
            
        cells.append({
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": outlier_code
        })

    # Cell 7: Build Pipeline
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["## 5. Build Preprocessing Pipeline"]
    })
    
    pipeline_code = [
        "# Identify columns\\n",
        "numeric_features = X_train.select_dtypes(include=['int64', 'float64']).columns.tolist()\\n",
        "categorical_features = X_train.select_dtypes(include=['object', 'category']).columns.tolist()\\n",
        "\\n",
        "# Define steps\\n",
        "numeric_steps = []\\n",
        "categorical_steps = []\\n"
    ]
    
    missing_option = preprocessing_config.get('missing_option', 'Fill with Mean')
    if missing_option == "Fill with Mean":
        pipeline_code.append("numeric_steps.append(('imputer', SimpleImputer(strategy='mean')))\\n")
    elif missing_option == "Fill with Median":
        pipeline_code.append("numeric_steps.append(('imputer', SimpleImputer(strategy='median')))\\n")
    elif missing_option == "KNN Imputation":
        pipeline_code.append("numeric_steps.append(('imputer', KNNImputer(n_neighbors=5)))\\n")
        
    scaling_method = preprocessing_config.get('scaling_method', 'None')
    if scaling_method == "StandardScaler":
        pipeline_code.append("numeric_steps.append(('scaler', StandardScaler()))\\n")
    elif scaling_method == "MinMaxScaler":
        pipeline_code.append("numeric_steps.append(('scaler', MinMaxScaler()))\\n")
        
    encoding_method = preprocessing_config.get('encoding_method', 'None')
    if encoding_method == "One-Hot Encoding":
        pipeline_code.append("categorical_steps.append(('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False)))\\n")
    elif encoding_method == "Label Encoding":
        pipeline_code.append("categorical_steps.append(('encoder', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1)))\\n")
        
    pipeline_code.extend([
        "\\n",
        "# Create ColumnTransformer\\n",
        "preprocessor = ColumnTransformer(\\n",
        "    transformers=[\\n",
        "        ('num', Pipeline(numeric_steps), numeric_features),\\n",
        "        ('cat', Pipeline(categorical_steps), categorical_features)\\n",
        "    ],\\n",
        "    remainder='passthrough'\\n",
        ")\\n",
        "\\n",
        "pipeline = Pipeline(steps=[('preprocessor', preprocessor)])"
    ])
    
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": pipeline_code
    })
    
    # Cell 8: Fit and Transform
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["## 6. Fit and Transform\\n", "Fit on Train, Transform on Train and Test."]
    })
    
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "pipeline.fit(X_train)\\n",
            "\\n",
            "X_train_processed = pipeline.transform(X_train)\\n",
            "X_test_processed = pipeline.transform(X_test)\\n",
            "\\n",
            "print('Pipeline executed successfully.')"
        ]
    })
    
    # Cell 9: Output/EDA
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["## 7. Result Analysis"]
    })
    
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "# Convert back to DataFrame for visualization (optional)\\n",
            "# Note: Column names might be lost or changed by OneHotEncoder\\n",
            "\\n",
            "print(f'Processed Train Shape: {X_train_processed.shape}')\\n",
            "print(f'Processed Test Shape: {X_test_processed.shape}')"
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
