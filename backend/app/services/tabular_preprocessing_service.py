import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler, RobustScaler, PolynomialFeatures
from sklearn.experimental import enable_iterative_imputer  # noqa
from sklearn.impute import KNNImputer, IterativeImputer
from sklearn.feature_selection import VarianceThreshold, mutual_info_classif, mutual_info_regression
from sklearn.experimental import enable_iterative_imputer  # noqa
from scipy import stats

def process_tabular_data(
    df: pd.DataFrame, 
    # Missing Values
    missing_option: str, 
    # Encoding
    encoding_method: str, 
    # Scaling
    scaling_method: str,
    # Outliers
    outlier_method: str = "None",
    # Feature Engineering
    feature_engineering_method: str = "None",
    date_feature_extraction: bool = False,
    text_feature_extraction: bool = False,
    rare_category_handling: bool = False,
    # Feature Selection
    remove_high_correlation: bool = False,
    low_variance_filtering: bool = False,
    feature_selection_method: str = "None", # New: Mutual Info
    # Cleaning
    remove_duplicates: bool = False,
    fix_numeric_formats: bool = False,
    fix_date_formats: bool = False,
    standardize_text: bool = False,
    # Advanced Encoding
    target_encoding: bool = False,
    frequency_encoding: bool = False,
    # Target
    target_column: str = None,
    smote_oversampling: bool = False,
    # Scope
    columns: list[str] = None,
) -> pd.DataFrame:
    """
    Enhanced tabular preprocessing service.
    """
    df = df.copy()
    
    # Handle scope (columns)
    if columns:
        valid_columns = [c for c in columns if c in df.columns]
        if not valid_columns:
            return df
        df_to_process = df[valid_columns].copy()
        df_remaining = df.drop(columns=valid_columns).copy()
    else:
        df_to_process = df
        df_remaining = None

    # --- 1. Data Cleaning ---
    if remove_duplicates:
        df_to_process.drop_duplicates(inplace=True)
        if df_remaining is not None:
            df_remaining = df_remaining.loc[df_to_process.index]

    if fix_numeric_formats:
        for col in df_to_process.select_dtypes(include=['object']).columns:
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

    # --- 2. Missing Values (Enhanced) ---
    numeric_cols = df_to_process.select_dtypes(include=np.number).columns
    categorical_cols = df_to_process.select_dtypes(include=['object', 'category']).columns

    if missing_option == "Drop Rows":
        df_to_process.dropna(inplace=True)
        if df_remaining is not None:
            df_remaining = df_remaining.loc[df_to_process.index]
            
    elif missing_option == "Fill with Mean":
        if not numeric_cols.empty:
            df_to_process[numeric_cols] = df_to_process[numeric_cols].fillna(df_to_process[numeric_cols].mean())
            
    elif missing_option == "Fill with Median":
        if not numeric_cols.empty:
            df_to_process[numeric_cols] = df_to_process[numeric_cols].fillna(df_to_process[numeric_cols].median())
            
    elif missing_option == "Fill with Mode":
        if not df_to_process.empty:
            df_to_process.fillna(df_to_process.mode().iloc[0], inplace=True)
            
    elif missing_option == "Forward Fill":
        df_to_process.fillna(method='ffill', inplace=True)
        
    elif missing_option == "KNN Imputation": # New
        if not numeric_cols.empty:
            imputer = KNNImputer(n_neighbors=5)
            df_to_process[numeric_cols] = imputer.fit_transform(df_to_process[numeric_cols])
            
    elif missing_option == "Iterative Imputation": # New
        if not numeric_cols.empty:
            imputer = IterativeImputer(random_state=0)
            df_to_process[numeric_cols] = imputer.fit_transform(df_to_process[numeric_cols])

    # --- 3. Outlier Detection ---
    if outlier_method != "None" and not numeric_cols.empty:
        if outlier_method == "Z-Score":
            z_scores = np.abs(stats.zscore(df_to_process[numeric_cols].fillna(0)))
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

    # --- 4. Feature Engineering ---
    if date_feature_extraction:
        for col in df_to_process.select_dtypes(include=['datetime64']).columns:
            df_to_process[f'{col}_year'] = df_to_process[col].dt.year
            df_to_process[f'{col}_month'] = df_to_process[col].dt.month
            df_to_process[f'{col}_day'] = df_to_process[col].dt.day
            df_to_process[f'{col}_weekday'] = df_to_process[col].dt.weekday

    if rare_category_handling:
        for col in categorical_cols:
            counts = df_to_process[col].value_counts(normalize=True)
            rare = counts[counts < 0.05].index
            df_to_process[col] = df_to_process[col].replace(rare, 'Other')

    # --- 5. Encoding ---
    # Refresh categorical columns after engineering
    categorical_cols = df_to_process.select_dtypes(include=['object', 'category']).columns.tolist()
    
    if categorical_cols:
        if encoding_method == "Label Encoding":
            for col in categorical_cols:
                df_to_process[col] = LabelEncoder().fit_transform(df_to_process[col].astype(str))
        elif encoding_method == "One-Hot Encoding":
            df_to_process = pd.get_dummies(df_to_process, columns=categorical_cols)
        elif frequency_encoding:
            for col in categorical_cols:
                freq = df_to_process[col].value_counts(normalize=True)
                df_to_process[f'{col}_freq'] = df_to_process[col].map(freq)
                df_to_process.drop(columns=[col], inplace=True)

    # --- 6. Feature Selection (Enhanced) ---
    if remove_high_correlation:
        numeric_df = df_to_process.select_dtypes(include=np.number)
        corr_matrix = numeric_df.corr().abs()
        upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
        to_drop = [column for column in upper.columns if any(upper[column] > 0.95)]
        df_to_process.drop(columns=to_drop, inplace=True)

    if low_variance_filtering:
        numeric_df = df_to_process.select_dtypes(include=np.number)
        if not numeric_df.empty:
            selector = VarianceThreshold(threshold=0.01)
            try:
                selector.fit(numeric_df)
                cols_to_keep = numeric_df.columns[selector.get_support()]
                cols_to_drop = list(set(numeric_df.columns) - set(cols_to_keep))
                df_to_process.drop(columns=cols_to_drop, inplace=True)
            except ValueError:
                pass

    if feature_selection_method == "Mutual Information" and target_column: # New
        # Simple implementation for classification/regression based on target type
        numeric_df = df_to_process.select_dtypes(include=np.number)
        if target_column in df.columns and not numeric_df.empty:
            y = df[target_column].loc[df_to_process.index]
            X = numeric_df.drop(columns=[target_column], errors='ignore')
            
            # Determine if classification or regression
            if pd.api.types.is_numeric_dtype(y) and y.nunique() > 20:
                mi = mutual_info_regression(X.fillna(0), y)
            else:
                mi = mutual_info_classif(X.fillna(0), y)
                
            # Keep top 50% features
            mi_series = pd.Series(mi, index=X.columns)
            top_features = mi_series.sort_values(ascending=False).head(int(len(X.columns) * 0.5)).index.tolist()
            
            # Drop others
            drop_cols = list(set(X.columns) - set(top_features))
            df_to_process.drop(columns=drop_cols, inplace=True)

    # --- 7. Scaling ---
    numerical_columns = df_to_process.select_dtypes(include=['int64', 'float64']).columns.tolist()
    if numerical_columns and scaling_method != "None":
        if scaling_method == "StandardScaler":
            scaler = StandardScaler()
            df_to_process[numerical_columns] = scaler.fit_transform(df_to_process[numerical_columns])
        elif scaling_method == "MinMaxScaler":
            scaler = MinMaxScaler()
            df_to_process[numerical_columns] = scaler.fit_transform(df_to_process[numerical_columns])
        elif scaling_method == "RobustScaler":
            scaler = RobustScaler()
            df_to_process[numerical_columns] = scaler.fit_transform(df_to_process[numerical_columns])

    # --- 8. SMOTE ---
    if smote_oversampling and target_column:
        current_df = df_to_process if df_remaining is None else pd.concat([df_remaining, df_to_process], axis=1)
        if target_column in current_df.columns:
            if not current_df.isnull().any().any() and all(pd.api.types.is_numeric_dtype(current_df[c]) for c in current_df.columns):
                try:
                    from imblearn.over_sampling import SMOTE
                    X = current_df.drop(columns=[target_column])
                    y = current_df[target_column]
                    smote = SMOTE()
                    X_res, y_res = smote.fit_resample(X, y)
                    current_df = pd.concat([pd.DataFrame(X_res, columns=X.columns), pd.DataFrame(y_res, columns=[target_column], name=target_column)], axis=1)
                    df_to_process = current_df
                    df_remaining = None
                except:
                    pass

    if df_remaining is not None:
        return pd.concat([df_remaining, df_to_process], axis=1)
    
    return df_to_process
