"""
Schema Analyzer
===============

Extracts comprehensive column profiles from a DataFrame.
This is the foundation of the Dataset Intelligence Engine.

WHY THIS MATTERS IN INDUSTRY:
-----------------------------
Before any ML work, you need to understand your data deeply:
- What types of data do you have?
- Which columns might be targets?
- Which columns are useless (IDs, constants)?
- What's the quality of each feature?

This module automates that discovery process.
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict, Any
from enum import Enum
from scipy import stats


class InferredType(str, Enum):
    """
    High-level semantic types that go beyond raw dtypes.
    
    WHY: A column might be 'int64' but semantically it's an ID or category.
    Understanding the semantic type helps choose the right preprocessing.
    """
    NUMERIC_CONTINUOUS = "numeric_continuous"
    NUMERIC_DISCRETE = "numeric_discrete"
    CATEGORICAL = "categorical"
    BINARY = "binary"
    DATETIME = "datetime"
    TEXT = "text"
    ID_LIKE = "id_like"
    CONSTANT = "constant"
    UNKNOWN = "unknown"


@dataclass
class ColumnProfile:
    """
    Comprehensive profile for a single column.
    
    This captures everything you need to know about a column
    to make preprocessing and modeling decisions.
    """
    # Basic info
    name: str
    dtype: str
    inferred_type: InferredType
    
    # Counts
    total_count: int
    missing_count: int
    missing_ratio: float
    unique_count: int
    unique_ratio: float
    
    # Numeric stats (None if not numeric)
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    mean: Optional[float] = None
    std: Optional[float] = None
    median: Optional[float] = None
    skewness: Optional[float] = None
    kurtosis: Optional[float] = None
    
    # Categorical insights
    top_values: Optional[List[Dict[str, Any]]] = None  # [{value, count, percentage}]
    
    # Quality flags
    is_constant: bool = False
    is_id_like: bool = False
    is_high_cardinality: bool = False
    is_mostly_missing: bool = False
    has_outliers: bool = False
    outlier_count: int = 0
    
    # Recommendations
    preprocessing_hints: List[str] = field(default_factory=list)
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        result = asdict(self)
        result['inferred_type'] = self.inferred_type.value
        return result


@dataclass
class SchemaReport:
    """
    Complete schema analysis report for a DataFrame.
    
    This is the primary output of SchemaAnalyzer and serves as input
    for downstream components (TargetDetector, InsightGenerator, etc.)
    """
    # Dataset-level stats
    row_count: int
    column_count: int
    memory_usage_bytes: int
    
    # Per-column profiles
    columns: List[ColumnProfile]
    
    # Summary counts
    numeric_columns: List[str] = field(default_factory=list)
    categorical_columns: List[str] = field(default_factory=list)
    datetime_columns: List[str] = field(default_factory=list)
    text_columns: List[str] = field(default_factory=list)
    id_columns: List[str] = field(default_factory=list)
    constant_columns: List[str] = field(default_factory=list)
    
    # Quality summary
    columns_with_missing: List[str] = field(default_factory=list)
    columns_with_outliers: List[str] = field(default_factory=list)
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "row_count": self.row_count,
            "column_count": self.column_count,
            "memory_usage_bytes": self.memory_usage_bytes,
            "columns": [col.to_dict() for col in self.columns],
            "numeric_columns": self.numeric_columns,
            "categorical_columns": self.categorical_columns,
            "datetime_columns": self.datetime_columns,
            "text_columns": self.text_columns,
            "id_columns": self.id_columns,
            "constant_columns": self.constant_columns,
            "columns_with_missing": self.columns_with_missing,
            "columns_with_outliers": self.columns_with_outliers,
        }
    
    def get_column(self, name: str) -> Optional[ColumnProfile]:
        """Get profile for a specific column."""
        for col in self.columns:
            if col.name == name:
                return col
        return None


class SchemaAnalyzer:
    """
    Analyzes DataFrame schema and generates comprehensive column profiles.
    
    HOW TO USE:
    -----------
    analyzer = SchemaAnalyzer()
    report = analyzer.analyze(df)
    
    # Access results
    print(f"Found {len(report.numeric_columns)} numeric columns")
    for col in report.columns:
        print(f"{col.name}: {col.inferred_type.value}")
    
    INDUSTRY CONTEXT:
    -----------------
    This is similar to tools like:
    - pandas-profiling / ydata-profiling
    - Great Expectations schema inference
    - AWS Glue data catalog
    
    But designed to feed directly into our ML pipeline decisions.
    """
    
    # Thresholds for classification (can be tuned)
    HIGH_CARDINALITY_THRESHOLD = 0.9  # Unique ratio above this = high cardinality
    MISSING_THRESHOLD = 0.5  # Above 50% missing = mostly_missing
    ID_LIKE_THRESHOLD = 0.95  # Unique ratio above this might be ID
    TEXT_AVG_LENGTH_THRESHOLD = 50  # Avg string length above this = likely text
    
    def analyze(self, df: pd.DataFrame) -> SchemaReport:
        """
        Generate a complete schema report for the DataFrame.
        
        Args:
            df: Input DataFrame to analyze
            
        Returns:
            SchemaReport with comprehensive column profiles
        """
        columns = []
        numeric_cols = []
        categorical_cols = []
        datetime_cols = []
        text_cols = []
        id_cols = []
        constant_cols = []
        missing_cols = []
        outlier_cols = []
        
        for col_name in df.columns:
            profile = self._analyze_column(df, col_name)
            columns.append(profile)
            
            # Categorize columns
            if profile.inferred_type == InferredType.NUMERIC_CONTINUOUS:
                numeric_cols.append(col_name)
            elif profile.inferred_type == InferredType.NUMERIC_DISCRETE:
                numeric_cols.append(col_name)
            elif profile.inferred_type == InferredType.CATEGORICAL:
                categorical_cols.append(col_name)
            elif profile.inferred_type == InferredType.BINARY:
                categorical_cols.append(col_name)
            elif profile.inferred_type == InferredType.DATETIME:
                datetime_cols.append(col_name)
            elif profile.inferred_type == InferredType.TEXT:
                text_cols.append(col_name)
            elif profile.inferred_type == InferredType.ID_LIKE:
                id_cols.append(col_name)
            elif profile.inferred_type == InferredType.CONSTANT:
                constant_cols.append(col_name)
            
            # Track quality issues
            if profile.missing_count > 0:
                missing_cols.append(col_name)
            if profile.has_outliers:
                outlier_cols.append(col_name)
        
        return SchemaReport(
            row_count=len(df),
            column_count=len(df.columns),
            memory_usage_bytes=int(df.memory_usage(deep=True).sum()),
            columns=columns,
            numeric_columns=numeric_cols,
            categorical_columns=categorical_cols,
            datetime_columns=datetime_cols,
            text_columns=text_cols,
            id_columns=id_cols,
            constant_columns=constant_cols,
            columns_with_missing=missing_cols,
            columns_with_outliers=outlier_cols,
        )
    
    def _analyze_column(self, df: pd.DataFrame, col_name: str) -> ColumnProfile:
        """
        Analyze a single column and return its profile.
        
        This is where the real intelligence happens - we look at
        multiple signals to infer the true semantic type.
        """
        series = df[col_name]
        dtype_str = str(series.dtype)
        
        # Basic counts
        total_count = len(series)
        missing_count = int(series.isna().sum())
        missing_ratio = missing_count / total_count if total_count > 0 else 0
        
        # Work with non-null values for analysis
        non_null = series.dropna()
        unique_count = int(non_null.nunique())
        unique_ratio = unique_count / len(non_null) if len(non_null) > 0 else 0
        
        # Initialize profile with basic info
        profile = ColumnProfile(
            name=col_name,
            dtype=dtype_str,
            inferred_type=InferredType.UNKNOWN,
            total_count=total_count,
            missing_count=missing_count,
            missing_ratio=round(missing_ratio, 4),
            unique_count=unique_count,
            unique_ratio=round(unique_ratio, 4),
        )
        
        # Check for constant
        if unique_count <= 1:
            profile.is_constant = True
            profile.inferred_type = InferredType.CONSTANT
            profile.preprocessing_hints.append("Consider dropping - constant column")
            return profile
        
        # Check for mostly missing
        if missing_ratio > self.MISSING_THRESHOLD:
            profile.is_mostly_missing = True
            profile.preprocessing_hints.append(f"High missing ratio ({missing_ratio:.1%}) - consider dropping or careful imputation")
        
        # Infer type based on dtype and content
        profile.inferred_type = self._infer_type(series, non_null, unique_count, unique_ratio)
        
        # Set flags based on inferred type
        if profile.inferred_type == InferredType.ID_LIKE:
            profile.is_id_like = True
            profile.preprocessing_hints.append("Likely an ID column - exclude from features")
        
        if unique_ratio > self.HIGH_CARDINALITY_THRESHOLD and profile.inferred_type == InferredType.CATEGORICAL:
            profile.is_high_cardinality = True
            profile.preprocessing_hints.append("High cardinality categorical - consider target encoding or hashing")
        
        # Compute stats for numeric columns
        if profile.inferred_type in [InferredType.NUMERIC_CONTINUOUS, InferredType.NUMERIC_DISCRETE]:
            self._compute_numeric_stats(profile, non_null)
        
        # Compute top values for categorical
        if profile.inferred_type in [InferredType.CATEGORICAL, InferredType.BINARY, InferredType.TEXT]:
            self._compute_top_values(profile, non_null)
        
        return profile
    
    def _infer_type(
        self, 
        series: pd.Series, 
        non_null: pd.Series, 
        unique_count: int, 
        unique_ratio: float
    ) -> InferredType:
        """
        Infer the semantic type of a column.
        
        This uses multiple heuristics to go beyond raw dtype.
        """
        dtype = series.dtype
        
        # Check for datetime
        if pd.api.types.is_datetime64_any_dtype(dtype):
            return InferredType.DATETIME
        
        # Try to detect datetime in object columns
        if dtype == object:
            sample = non_null.head(100)
            try:
                pd.to_datetime(sample, infer_datetime_format=True)
                return InferredType.DATETIME
            except (ValueError, TypeError):
                pass
        
        # Check for numeric
        if pd.api.types.is_numeric_dtype(dtype):
            # Check if it looks like an ID (sequential integers, high unique)
            if pd.api.types.is_integer_dtype(dtype):
                if unique_ratio > self.ID_LIKE_THRESHOLD:
                    # Check if values are sequential
                    if len(non_null) > 10:
                        sorted_vals = non_null.sort_values().reset_index(drop=True)
                        diffs = sorted_vals.diff().dropna()
                        if (diffs == 1).mean() > 0.9:
                            return InferredType.ID_LIKE
                
                # Binary?
                if unique_count == 2:
                    return InferredType.BINARY
                
                # Discrete (few unique values)?
                if unique_count < 20:
                    return InferredType.NUMERIC_DISCRETE
            
            return InferredType.NUMERIC_CONTINUOUS
        
        # Check for boolean
        if pd.api.types.is_bool_dtype(dtype):
            return InferredType.BINARY
        
        # String/object type
        if dtype == object:
            # Binary?
            if unique_count == 2:
                return InferredType.BINARY
            
            # High cardinality strings might be IDs
            if unique_ratio > self.ID_LIKE_THRESHOLD:
                return InferredType.ID_LIKE
            
            # Check average string length to detect text vs categorical
            avg_length = non_null.astype(str).str.len().mean()
            if avg_length > self.TEXT_AVG_LENGTH_THRESHOLD:
                return InferredType.TEXT
            
            return InferredType.CATEGORICAL
        
        return InferredType.UNKNOWN
    
    def _compute_numeric_stats(self, profile: ColumnProfile, non_null: pd.Series) -> None:
        """Compute statistics for numeric columns."""
        try:
            profile.min_value = float(non_null.min())
            profile.max_value = float(non_null.max())
            profile.mean = float(non_null.mean())
            profile.std = float(non_null.std())
            profile.median = float(non_null.median())
            
            # Skewness and kurtosis
            if len(non_null) > 3:
                profile.skewness = float(stats.skew(non_null))
                profile.kurtosis = float(stats.kurtosis(non_null))
                
                # Add hints based on distribution
                if abs(profile.skewness) > 1:
                    profile.preprocessing_hints.append(
                        f"Skewed distribution ({profile.skewness:.2f}) - consider log transform"
                    )
            
            # Detect outliers using IQR
            Q1 = non_null.quantile(0.25)
            Q3 = non_null.quantile(0.75)
            IQR = Q3 - Q1
            outlier_mask = (non_null < (Q1 - 1.5 * IQR)) | (non_null > (Q3 + 1.5 * IQR))
            profile.outlier_count = int(outlier_mask.sum())
            profile.has_outliers = profile.outlier_count > 0
            
            if profile.has_outliers:
                outlier_pct = profile.outlier_count / len(non_null) * 100
                profile.preprocessing_hints.append(
                    f"Contains {profile.outlier_count} outliers ({outlier_pct:.1f}%)"
                )
                
        except Exception:
            pass  # Skip stats if computation fails
    
    def _compute_top_values(self, profile: ColumnProfile, non_null: pd.Series) -> None:
        """Compute top values for categorical/text columns."""
        try:
            value_counts = non_null.value_counts().head(10)
            total = len(non_null)
            
            profile.top_values = [
                {
                    "value": str(val),
                    "count": int(count),
                    "percentage": round(count / total * 100, 2)
                }
                for val, count in value_counts.items()
            ]
        except Exception:
            pass
