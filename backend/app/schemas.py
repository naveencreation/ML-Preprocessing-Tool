from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum

class ProcessingLogBase(BaseModel):
    action: str
    parameters: Optional[Dict[str, Any]] = None

class ProcessingLogCreate(ProcessingLogBase):
    pass

class ProcessingLog(ProcessingLogBase):
    id: int
    dataset_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class DatasetBase(BaseModel):
    filename: str

class DatasetCreate(DatasetBase):
    pass

class DatasetUpdate(DatasetBase):
    pass

class Dataset(DatasetBase):
    id: int
    filepath: str
    upload_date: datetime
    size_bytes: int
    row_count: int
    column_count: int
    status: str
    parent_dataset_id: Optional[int] = None
    processing_logs: List[ProcessingLog] = []

    class Config:
        from_attributes = True

class MissingValueOption(str, Enum):
    DROP_ROWS = "Drop Rows"
    MEAN = "Mean"
    MEDIAN = "Median"
    MODE = "Mode"
    CONSTANT = "Constant"
    NONE = "None"
    FORWARD_FILL = "Forward Fill"
    BACKWARD_FILL = "Backward Fill"
    KNN = "KNN Imputation"
    ITERATIVE = "Iterative Imputation"

class EncodingOption(str, Enum):
    NONE = "None"
    LABEL = "Label Encoding"
    ONE_HOT = "One-Hot Encoding"
    FREQUENCY = "Frequency Encoding"

class ScalingOption(str, Enum):
    NONE = "None"
    STANDARD = "StandardScaler"
    MIN_MAX = "MinMaxScaler"
    ROBUST = "RobustScaler"

class PreprocessingOptions(BaseModel):
    # General
    missing_option: MissingValueOption = MissingValueOption.DROP_ROWS
    columns: Optional[List[str]] = None
    target_column: Optional[str] = None
    
    # Tabular Specific
    encoding_method: EncodingOption = EncodingOption.NONE
    scaling_method: ScalingOption = ScalingOption.NONE
    outlier_method: str = "None" # "None", "Z-Score", "IQR"
    feature_engineering_method: str = "None" # "None", "Polynomial Features"
    
    # Data Cleaning
    remove_duplicates: bool = False
    fix_numeric_formats: bool = False
    fix_date_formats: bool = False
    standardize_text: bool = False
    
    # Feature Engineering
    target_encoding: bool = False
    frequency_encoding: bool = False
    date_feature_extraction: bool = False
    text_feature_extraction: bool = False
    rare_category_handling: bool = False
    
    # Text Specific
    text_cleaning_method: str = "None" # "None", "Simple", "Advanced"
    stopword_removal: bool = False
    stemming: bool = False
    lemmatization: bool = False
    tokenization: bool = False
    vectorization_method: str = "None" # "None", "TF-IDF", "Count", "Word2Vec"

    # Image Specific
    image_resize: bool = False
    image_width: int = 224
    image_height: int = 224
    image_grayscale: bool = False
    image_normalize: bool = False # 0-255 -> 0-1
    image_augmentation: bool = False # Basic rotation/flipping

    # Audio Specific
    audio_resample: bool = False
    audio_sample_rate: int = 16000
    audio_trim_silence: bool = False
    audio_duration: float = 0.0 # 0 means no trimming
    audio_feature_extraction: str = "None" # "None", "MFCC", "Spectrogram", "Chroma"
    
    # Time-Series Specific
    ts_resample: bool = False
    ts_resample_freq: str = "D" # D, H, T, etc.
    ts_handle_missing: str = "Forward Fill" # Forward Fill, Backward Fill, Interpolate
    ts_rolling_window: bool = False
    ts_window_size: int = 3
    ts_lag_features: bool = False
    ts_lags: int = 1
    ts_decompose: bool = False # Trend, Seasonality, Residual

    # Log Specific
    log_parse_timestamp: bool = False
    log_extract_levels: bool = False # INFO, ERROR, etc.
    log_pattern_extraction: str = "" # Regex pattern

    # Target Processing
    smote_oversampling: bool = False
    
    # Feature Selection
    remove_high_correlation: bool = False
    low_variance_filtering: bool = False
    feature_selection_method: str = "None" # "None", "Mutual Information"
    
    # Split
    train_test_split: bool = False
    test_size: float = 0.2
    stratify: bool = False

    @classmethod
    def __get_validators__(cls):
        yield cls.validate_options
    
    @classmethod
    def validate_options(cls, values):
        """Validate preprocessing options"""
        # Pydantic will handle Enum validation automatically for the typed fields.
        # We can keep this for other fields if needed, or remove it if Enums cover everything.
        return values

class CodeGenerationRequest(BaseModel):
    options: PreprocessingOptions

class CodeGenerationResponse(BaseModel):
    code: str
    filename: str

class WorkflowTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    config: PreprocessingOptions

class WorkflowTemplateCreate(WorkflowTemplateBase):
    pass

class WorkflowTemplate(WorkflowTemplateBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
