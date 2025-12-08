import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler, RobustScaler, OneHotEncoder, FunctionTransformer
from sklearn.experimental import enable_iterative_imputer  # noqa
from sklearn.impute import KNNImputer, IterativeImputer, SimpleImputer
from sklearn.feature_selection import VarianceThreshold
from scipy import stats
from app.services.transformers import NumericCleaner, TextStandardizer, DateFeatureExtractor, RareCategoryEncoder

def clean_data(
    df: pd.DataFrame,
    remove_duplicates: bool = False,
    outlier_method: str = "None",
    columns: list[str] = None
) -> pd.DataFrame:
    """
    Performs row-wise cleaning operations that CANNOT be part of a standard sklearn pipeline
    because they change the number of samples (e.g., dropping duplicates, dropping outliers).
    
    This should be applied to the TRAINING set only (or carefully to test set for duplicates).
    """
    df = df.copy()
    
    # Scope
    if columns:
        valid_columns = [c for c in columns if c in df.columns]
        if not valid_columns:
            return df
        # We need to keep all columns for row dropping to stay aligned
    
    # 1. Remove Duplicates
    if remove_duplicates:
        df.drop_duplicates(inplace=True)

    # 2. Outlier Removal (Z-Score / IQR)
    # Note: In a real pipeline, we might just clip outliers. Dropping rows is aggressive.
    numeric_cols = df.select_dtypes(include=np.number).columns
    if outlier_method != "None" and not numeric_cols.empty:
        if outlier_method == "Z-Score":
            z_scores = np.abs(stats.zscore(df[numeric_cols].fillna(0)))
            df = df[(z_scores < 3).all(axis=1)]
            
        elif outlier_method == "IQR":
            Q1 = df[numeric_cols].quantile(0.25)
            Q3 = df[numeric_cols].quantile(0.75)
            IQR = Q3 - Q1
            condition = ~((df[numeric_cols] < (Q1 - 1.5 * IQR)) | (df[numeric_cols] > (Q3 + 1.5 * IQR))).any(axis=1)
            df = df[condition]
            
        elif outlier_method == "Cap Outliers":
            # Capping can be done in the pipeline! It preserves row count.
            # We will handle this in the pipeline if possible, or here if we want to simplify.
            # Let's do it here for now as it's a "cleaning" step.
            Q1 = df[numeric_cols].quantile(0.05)
            Q3 = df[numeric_cols].quantile(0.95)
            for col in numeric_cols:
                df[col] = df[col].clip(lower=Q1[col], upper=Q3[col])

    return df

def build_pipeline(
    df_sample: pd.DataFrame, # Needed to identify column types
    # Missing Values
    missing_option: str, 
    # Encoding
    encoding_method: str, 
    # Scaling
    scaling_method: str,
    # Feature Engineering
    date_feature_extraction: bool = False,
    text_feature_extraction: bool = False, # TODO: Add text vectorizer to pipeline
    rare_category_handling: bool = False,
    # Feature Selection
    remove_high_correlation: bool = False, # Hard to do in pipeline without custom transformer
    low_variance_filtering: bool = False,
    # Cleaning (Column-wise)
    fix_numeric_formats: bool = False,
    standardize_text: bool = False,
    # Scope
    columns: list[str] = None,
) -> Pipeline:
    """
    Constructs a Scikit-Learn Pipeline for the transformation steps.
    This pipeline can be fitted on Train data and used on Test/Inference data.
    """
    
    steps = []
    
    # --- 1. Custom Cleaners (Transformers) ---
    if fix_numeric_formats:
        steps.append(('numeric_cleaner', NumericCleaner(columns=columns)))
        
    if standardize_text:
        steps.append(('text_standardizer', TextStandardizer(columns=columns)))
        
    if date_feature_extraction:
        steps.append(('date_extractor', DateFeatureExtractor(columns=columns)))
        
    if rare_category_handling:
        steps.append(('rare_encoder', RareCategoryEncoder(columns=columns)))

    # --- 2. Imputation ---
    # We need to separate Numeric and Categorical for imputation
    # This requires a ColumnTransformer
    
    # Identify columns (heuristic based on sample)
    numeric_features = df_sample.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_features = df_sample.select_dtypes(include=['object', 'category']).columns.tolist()
    
    if columns:
        numeric_features = [c for c in numeric_features if c in columns]
        categorical_features = [c for c in categorical_features if c in columns]

    # Define Imputers
    numeric_imputer = None
    categorical_imputer = None
    
    if missing_option == "Fill with Mean":
        numeric_imputer = SimpleImputer(strategy='mean')
    elif missing_option == "Fill with Median":
        numeric_imputer = SimpleImputer(strategy='median')
    elif missing_option == "Fill with Mode":
        numeric_imputer = SimpleImputer(strategy='most_frequent')
        categorical_imputer = SimpleImputer(strategy='most_frequent')
    elif missing_option == "KNN Imputation":
        numeric_imputer = KNNImputer(n_neighbors=5)
    elif missing_option == "Iterative Imputation":
        numeric_imputer = IterativeImputer(random_state=0)
    # "Drop Rows" is handled in clean_data, not here.
    
    # If no specific categorical imputer chosen, default to constant or mode?
    if categorical_imputer is None:
        categorical_imputer = SimpleImputer(strategy='constant', fill_value='Missing')

    # --- 3. Encoding ---
    encoder = None
    if encoding_method == "One-Hot Encoding":
        encoder = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
    elif encoding_method == "Label Encoding":
        # LabelEncoder is tricky in Pipelines for X (it's meant for y). 
        # OrdinalEncoder is better for X.
        from sklearn.preprocessing import OrdinalEncoder
        encoder = OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1)
    
    # --- 4. Scaling ---
    scaler = None
    if scaling_method == "StandardScaler":
        scaler = StandardScaler()
    elif scaling_method == "MinMaxScaler":
        scaler = MinMaxScaler()
    elif scaling_method == "RobustScaler":
        scaler = RobustScaler()

    # --- Construct Column Transformer ---
    # We need to chain Impute -> Scale/Encode
    # So we create pipelines for branches
    
    numeric_steps = []
    if numeric_imputer: numeric_steps.append(('imputer', numeric_imputer))
    if low_variance_filtering: numeric_steps.append(('variance_threshold', VarianceThreshold(threshold=0.01)))
    if scaler: numeric_steps.append(('scaler', scaler))
    
    categorical_steps = []
    if categorical_imputer: categorical_steps.append(('imputer', categorical_imputer))
    if encoder: categorical_steps.append(('encoder', encoder))
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', Pipeline(numeric_steps), numeric_features),
            ('cat', Pipeline(categorical_steps), categorical_features)
        ],
        remainder='passthrough' # Keep other columns
    )
    
    steps.append(('preprocessor', preprocessor))
    
    return Pipeline(steps)
