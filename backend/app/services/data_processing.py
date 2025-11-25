import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler

def process_dataframe(
    df: pd.DataFrame, 
    missing_option: str, 
    encoding_method: str, 
    scaling_method: str,
    outlier_method: str = "None",
    feature_engineering_method: str = "None",
    columns: list[str] = None
) -> pd.DataFrame:
    """
    Applies preprocessing steps to the dataframe with intelligent type handling.
    If columns list is provided, only applies transformations to those columns.
    """
    df = df.copy()
    
    # If columns are specified, we'll only process those
    # But we need to keep the other columns unchanged
    if columns:
        # Validate columns exist
        valid_columns = [c for c in columns if c in df.columns]
        if not valid_columns:
            # If no valid columns selected, return original (or handle as error)
            return df
            
        # Split dataframe
        df_to_process = df[valid_columns].copy()
        df_remaining = df.drop(columns=valid_columns).copy()
    else:
        df_to_process = df
        df_remaining = None

    # --- PROCESSING START (on df_to_process) ---

    # 1. Handle Missing Values
    if missing_option == "Drop Rows":
        df_to_process.dropna(inplace=True)
        # If we drop rows in processed part, we must align remaining part
        if df_remaining is not None:
            df_remaining = df_remaining.loc[df_to_process.index]
            
    elif missing_option == "Fill with Mean":
        # Only fill numeric columns with mean
        numeric_cols = df_to_process.select_dtypes(include=np.number).columns
        if not numeric_cols.empty:
            df_to_process[numeric_cols] = df_to_process[numeric_cols].fillna(df_to_process[numeric_cols].mean())
            
    elif missing_option == "Fill with Median":
        numeric_cols = df_to_process.select_dtypes(include=np.number).columns
        if not numeric_cols.empty:
            df_to_process[numeric_cols] = df_to_process[numeric_cols].fillna(df_to_process[numeric_cols].median())
            
    elif missing_option == "Fill with Mode":
        # Fill all columns in selection with mode
        if not df_to_process.empty:
            df_to_process.fillna(df_to_process.mode().iloc[0], inplace=True)

    # 2. Outlier Detection (Remove Rows)
    # Only apply to numeric columns
    if outlier_method != "None":
        numeric_cols = df_to_process.select_dtypes(include=np.number).columns
        if not numeric_cols.empty:
            if outlier_method == "Z-Score":
                from scipy import stats
                # Calculate Z-scores
                z_scores = np.abs(stats.zscore(df_to_process[numeric_cols]))
                # Keep rows where all z-scores are < 3
                df_to_process = df_to_process[(z_scores < 3).all(axis=1)]
                
            elif outlier_method == "IQR":
                Q1 = df_to_process[numeric_cols].quantile(0.25)
                Q3 = df_to_process[numeric_cols].quantile(0.75)
                IQR = Q3 - Q1
                # Keep rows within 1.5*IQR
                condition = ~((df_to_process[numeric_cols] < (Q1 - 1.5 * IQR)) | (df_to_process[numeric_cols] > (Q3 + 1.5 * IQR))).any(axis=1)
                df_to_process = df_to_process[condition]
            
            # Sync remaining df if rows were dropped
            if df_remaining is not None:
                df_remaining = df_remaining.loc[df_to_process.index]

    # 3. Encoding Categorical Variables
    categorical_columns = df_to_process.select_dtypes(include=['object']).columns.tolist()
    if categorical_columns and encoding_method != "None":
        if encoding_method == "Label Encoding":
            for col in categorical_columns:
                df_to_process[col] = LabelEncoder().fit_transform(df_to_process[col].astype(str))
        elif encoding_method == "One-Hot Encoding":
            df_to_process = pd.get_dummies(df_to_process, columns=categorical_columns)

    # 4. Feature Engineering
    if feature_engineering_method == "Polynomial Features":
        from sklearn.preprocessing import PolynomialFeatures
        # Apply only to numeric columns
        numeric_cols = df_to_process.select_dtypes(include=np.number).columns.tolist()
        if numeric_cols:
            poly = PolynomialFeatures(degree=2, include_bias=False)
            poly_features = poly.fit_transform(df_to_process[numeric_cols])
            feature_names = poly.get_feature_names_out(numeric_cols)
            
            # Create new dataframe with poly features
            df_poly = pd.DataFrame(poly_features, columns=feature_names, index=df_to_process.index)
            
            # Drop original numeric columns and replace with poly features
            # Or keep them? PolynomialFeatures includes original features by default if interaction_only=False
            # But get_feature_names_out includes them. So we can just replace the numeric part.
            
            # Drop original numeric columns from df_to_process
            df_to_process = df_to_process.drop(columns=numeric_cols)
            
            # Concatenate poly features
            df_to_process = pd.concat([df_to_process, df_poly], axis=1)

    # 5. Scaling Numerical Features
    # Re-select numerical columns after encoding and feature engineering
    numerical_columns = df_to_process.select_dtypes(include=['int64', 'float64']).columns.tolist()
    if numerical_columns and scaling_method != "None":
        if scaling_method == "StandardScaler":
            scaler = StandardScaler()
            df_to_process[numerical_columns] = scaler.fit_transform(df_to_process[numerical_columns])
        elif scaling_method == "MinMaxScaler":
            scaler = MinMaxScaler()
            df_to_process[numerical_columns] = scaler.fit_transform(df_to_process[numerical_columns])

    # --- PROCESSING END ---

    # --- PROCESSING END ---

    # Merge back if we split
    if df_remaining is not None:
        # Join on index to ensure alignment
        return pd.concat([df_remaining, df_to_process], axis=1)
    
    return df_to_process
