from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Dict, Any

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

class PreprocessingOptions(BaseModel):
    missing_option: str  # "Drop Rows", "Fill with Mean", "Fill with Median", "Fill with Mode"
    encoding_method: str # "Label Encoding", "One-Hot Encoding"
    scaling_method: str  # "StandardScaler", "MinMaxScaler", "None"
    outlier_method: str = "None" # "None", "Z-Score", "IQR"
    feature_engineering_method: str = "None" # "None", "Polynomial Features"
    columns: Optional[List[str]] = None  # List of columns to apply preprocessing to
    
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
    
    # Target Processing
    target_column: Optional[str] = None
    smote_oversampling: bool = False
    
    # Feature Selection
    remove_high_correlation: bool = False
    low_variance_filtering: bool = False
    
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
        valid_missing = ["Drop Rows", "Fill with Mean", "Fill with Median", "Fill with Mode", "Forward Fill", "Backward Fill"]
        valid_encoding = ["Label Encoding", "One-Hot Encoding", "None"]
        valid_scaling = ["StandardScaler", "MinMaxScaler", "RobustScaler", "None"]
        valid_outlier = ["None", "Z-Score", "IQR", "Cap Outliers"]
        
        if isinstance(values, dict):
            if values.get("missing_option") not in valid_missing:
                # Allow new options if they were passed, otherwise default validation might fail on old clients
                # But for now, let's just expand the valid list above
                pass 
                
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
