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
    columns: list[str] = None,
    # New Options
    remove_duplicates: bool = False,
    fix_numeric_formats: bool = False,
    fix_date_formats: bool = False,
    standardize_text: bool = False,
    target_encoding: bool = False,
    frequency_encoding: bool = False,
    date_feature_extraction: bool = False,
    text_feature_extraction: bool = False,
    rare_category_handling: bool = False,
    target_column: str = None,
    smote_oversampling: bool = False,
    remove_high_correlation: bool = False,
    low_variance_filtering: bool = False
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
            return df
            
        # Split dataframe
        df_to_process = df[valid_columns].copy()
        df_remaining = df.drop(columns=valid_columns).copy()
    else:
        df_to_process = df
        df_remaining = None

    # --- PROCESSING START (on df_to_process) ---

    # 0. Data Cleaning (New Steps)
    if remove_duplicates:
        df_to_process.drop_duplicates(inplace=True)
        if df_remaining is not None:
            df_remaining = df_remaining.loc[df_to_process.index]

    if fix_numeric_formats:
        # Try to clean currency, percentages, etc.
        for col in df_to_process.select_dtypes(include=['object']).columns:
            # Check if column looks numeric-ish
            sample = df_to_process[col].dropna().astype(str).head(100)
            if sample.str.match(r'^[\$€£]?\s*-?[\d,]+(\.\d+)?%?$').any():
                df_to_process[col] = df_to_process[col].astype(str).str.replace(r'[^\d.-]', '', regex=True)
                df_to_process[col] = pd.to_numeric(df_to_process[col], errors='coerce')

    if standardize_text:
        for col in df_to_process.select_dtypes(include=['object']).columns:
            df_to_process[col] = df_to_process[col].astype(str).str.lower().str.strip()

    if fix_date_formats:
        for col in df_to_process.columns:
            if df_to_process[col].dtype == 'object':
                try:
                    df_to_process[col] = pd.to_datetime(df_to_process[col], errors='ignore')
                except:
                    pass

    # 1. Handle Missing Values
    if missing_option == "Drop Rows":
        df_to_process.dropna(inplace=True)
        if df_remaining is not None:
            df_remaining = df_remaining.loc[df_to_process.index]
            
    elif missing_option == "Fill with Mean":
        numeric_cols = df_to_process.select_dtypes(include=np.number).columns
        if not numeric_cols.empty:
            df_to_process[numeric_cols] = df_to_process[numeric_cols].fillna(df_to_process[numeric_cols].mean())
            
    elif missing_option == "Fill with Median":
        numeric_cols = df_to_process.select_dtypes(include=np.number).columns
        if not numeric_cols.empty:
            df_to_process[numeric_cols] = df_to_process[numeric_cols].fillna(df_to_process[numeric_cols].median())
            
    elif missing_option == "Fill with Mode":
        if not df_to_process.empty:
            df_to_process.fillna(df_to_process.mode().iloc[0], inplace=True)
            
    elif missing_option == "Forward Fill":
        df_to_process.fillna(method='ffill', inplace=True)
        
    elif missing_option == "Backward Fill":
        df_to_process.fillna(method='bfill', inplace=True)

    # 2. Outlier Detection (Remove Rows)
    if outlier_method != "None":
        numeric_cols = df_to_process.select_dtypes(include=np.number).columns
        if not numeric_cols.empty:
            if outlier_method == "Z-Score":
                from scipy import stats
                z_scores = np.abs(stats.zscore(df_to_process[numeric_cols].fillna(0))) # Fillna to avoid error
                df_to_process = df_to_process[(z_scores < 3).all(axis=1)]
                
            elif outlier_method == "IQR":
                Q1 = df_to_process[numeric_cols].quantile(0.25)
                Q3 = df_to_process[numeric_cols].quantile(0.75)
                IQR = Q3 - Q1
                condition = ~((df_to_process[numeric_cols] < (Q1 - 1.5 * IQR)) | (df_to_process[numeric_cols] > (Q3 + 1.5 * IQR))).any(axis=1)
                df_to_process = df_to_process[condition]
            
            elif outlier_method == "Cap Outliers":
                Q1 = df_to_process[numeric_cols].quantile(0.05)
                Q3 = df_to_process[numeric_cols].quantile(0.95)
                for col in numeric_cols:
                    df_to_process[col] = df_to_process[col].clip(lower=Q1[col], upper=Q3[col])
            
            if df_remaining is not None:
                df_remaining = df_remaining.loc[df_to_process.index]

    # 3. Feature Engineering (New Steps)
    if date_feature_extraction:
        for col in df_to_process.select_dtypes(include=['datetime64']).columns:
            df_to_process[f'{col}_year'] = df_to_process[col].dt.year
            df_to_process[f'{col}_month'] = df_to_process[col].dt.month
            df_to_process[f'{col}_day'] = df_to_process[col].dt.day
            df_to_process[f'{col}_weekday'] = df_to_process[col].dt.weekday
            # Drop original date column? Maybe optional, but usually good practice for ML
            # df_to_process.drop(columns=[col], inplace=True)

    if rare_category_handling:
        for col in df_to_process.select_dtypes(include=['object']).columns:
            counts = df_to_process[col].value_counts(normalize=True)
            rare = counts[counts < 0.05].index
            df_to_process[col] = df_to_process[col].replace(rare, 'Other')

    # 4. Encoding Categorical Variables
    categorical_columns = df_to_process.select_dtypes(include=['object']).columns.tolist()
    if categorical_columns:
        if encoding_method == "Label Encoding":
            for col in categorical_columns:
                df_to_process[col] = LabelEncoder().fit_transform(df_to_process[col].astype(str))
        elif encoding_method == "One-Hot Encoding":
            df_to_process = pd.get_dummies(df_to_process, columns=categorical_columns)
        elif frequency_encoding:
            for col in categorical_columns:
                freq = df_to_process[col].value_counts(normalize=True)
                df_to_process[f'{col}_freq'] = df_to_process[col].map(freq)
                df_to_process.drop(columns=[col], inplace=True)
        elif target_encoding and target_column and target_column in df.columns:
            # Target encoding requires the target column. 
            # If target is in df_remaining, we need to access it.
            target_series = df[target_column].loc[df_to_process.index] if target_column not in df_to_process else df_to_process[target_column]
            for col in categorical_columns:
                if col != target_column:
                    means = df_to_process.groupby(col)[target_column].mean() if col in df_to_process else df.groupby(col)[target_column].mean()
                    df_to_process[f'{col}_target_enc'] = df_to_process[col].map(means)
                    df_to_process.drop(columns=[col], inplace=True)

    # 5. Advanced Feature Engineering
    if feature_engineering_method == "Polynomial Features":
        from sklearn.preprocessing import PolynomialFeatures
        numeric_cols = df_to_process.select_dtypes(include=np.number).columns.tolist()
        if numeric_cols:
            poly = PolynomialFeatures(degree=2, include_bias=False)
            poly_features = poly.fit_transform(df_to_process[numeric_cols].fillna(0))
            feature_names = poly.get_feature_names_out(numeric_cols)
            df_poly = pd.DataFrame(poly_features, columns=feature_names, index=df_to_process.index)
            df_to_process = df_to_process.drop(columns=numeric_cols)
            df_to_process = pd.concat([df_to_process, df_poly], axis=1)

    # 6. Feature Selection
    if remove_high_correlation:
        numeric_df = df_to_process.select_dtypes(include=np.number)
        corr_matrix = numeric_df.corr().abs()
        upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
        to_drop = [column for column in upper.columns if any(upper[column] > 0.95)]
        df_to_process.drop(columns=to_drop, inplace=True)

    if low_variance_filtering:
        from sklearn.feature_selection import VarianceThreshold
        numeric_df = df_to_process.select_dtypes(include=np.number)
        if not numeric_df.empty:
            selector = VarianceThreshold(threshold=0.01)
            try:
                selector.fit(numeric_df)
                cols_to_keep = numeric_df.columns[selector.get_support()]
                cols_to_drop = list(set(numeric_df.columns) - set(cols_to_keep))
                df_to_process.drop(columns=cols_to_drop, inplace=True)
            except ValueError:
                pass # Might fail if all features have low variance or empty

    # 7. Scaling Numerical Features
    numerical_columns = df_to_process.select_dtypes(include=['int64', 'float64']).columns.tolist()
    if numerical_columns and scaling_method != "None":
        if scaling_method == "StandardScaler":
            scaler = StandardScaler()
            df_to_process[numerical_columns] = scaler.fit_transform(df_to_process[numerical_columns])
        elif scaling_method == "MinMaxScaler":
            scaler = MinMaxScaler()
            df_to_process[numerical_columns] = scaler.fit_transform(df_to_process[numerical_columns])
        elif scaling_method == "RobustScaler":
            from sklearn.preprocessing import RobustScaler
            scaler = RobustScaler()
            df_to_process[numerical_columns] = scaler.fit_transform(df_to_process[numerical_columns])

    # 8. Target Processing (SMOTE)
    if smote_oversampling and target_column:
        # SMOTE requires all data to be numeric and no missing values
        # We must merge first to apply SMOTE on the whole dataset (features + target)
        # But wait, SMOTE generates new rows. This complicates things if we split.
        # For simplicity, we only apply SMOTE if we are processing the whole dataframe or if target is included.
        
        # Check if we can apply SMOTE
        current_df = df_to_process if df_remaining is None else pd.concat([df_remaining, df_to_process], axis=1)
        
        if target_column in current_df.columns:
            # Ensure no missing values
            if not current_df.isnull().any().any():
                # Ensure all columns are numeric
                if all(pd.api.types.is_numeric_dtype(current_df[c]) for c in current_df.columns):
                    try:
                        from imblearn.over_sampling import SMOTE
                        X = current_df.drop(columns=[target_column])
                        y = current_df[target_column]
                        smote = SMOTE()
                        X_res, y_res = smote.fit_resample(X, y)
                        
                        # Reconstruct
                        current_df = pd.concat([pd.DataFrame(X_res, columns=X.columns), pd.DataFrame(y_res, columns=[target_column], name=target_column)], axis=1)
                        
                        # Update df_to_process and clear df_remaining since we merged
                        df_to_process = current_df
                        df_remaining = None
                    except ImportError:
                        print("imblearn not installed, skipping SMOTE")
                    except Exception as e:
                        print(f"SMOTE failed: {e}")

    # --- PROCESSING END ---

    # Merge back if we split
    if df_remaining is not None:
        return pd.concat([df_remaining, df_to_process], axis=1)
    
    return df_to_process
