"""
Target Detector
===============

Detects potential target columns and classifies the ML problem type.

WHY THIS MATTERS:
-----------------
Choosing the right target and understanding the problem type is critical:
- Wrong target = wrong model
- Wrong problem type = wrong metrics and approach

This module uses rule-based heuristics to suggest targets,
with optional LLM enhancement for complex cases.
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from enum import Enum

from .schema_analyzer import SchemaReport, ColumnProfile, InferredType


class ProblemType(str, Enum):
    """
    Classification of ML problem types.
    
    This determines:
    - Which models to consider
    - Which metrics to use
    - How to preprocess data
    """
    BINARY_CLASSIFICATION = "binary_classification"
    MULTICLASS_CLASSIFICATION = "multiclass_classification"
    REGRESSION = "regression"
    ORDINAL_CLASSIFICATION = "ordinal_classification"
    TIME_SERIES = "time_series"
    CLUSTERING = "clustering"
    ANOMALY_DETECTION = "anomaly_detection"
    UNSUPERVISED = "unsupervised"
    UNKNOWN = "unknown"


@dataclass
class TargetCandidate:
    """
    A potential target column with confidence score and reasoning.
    """
    column: str
    confidence: float  # 0.0 to 1.0
    problem_type: ProblemType
    reasons: List[str]
    warnings: List[str] = field(default_factory=list)
    
    def to_dict(self) -> dict:
        return {
            "column": self.column,
            "confidence": round(self.confidence, 2),
            "problem_type": self.problem_type.value,
            "reasons": self.reasons,
            "warnings": self.warnings
        }


@dataclass  
class TargetAnalysis:
    """
    Complete target detection analysis.
    """
    # Suggested targets (ranked by confidence)
    candidates: List[TargetCandidate]
    
    # If no target is suitable
    unsupervised_suggested: bool
    unsupervised_tasks: List[str] = field(default_factory=list)
    
    # Additional context
    notes: List[str] = field(default_factory=list)
    
    def to_dict(self) -> dict:
        return {
            "candidates": [c.to_dict() for c in self.candidates],
            "unsupervised_suggested": self.unsupervised_suggested,
            "unsupervised_tasks": self.unsupervised_tasks,
            "notes": self.notes
        }
    
    @property
    def best_candidate(self) -> Optional[TargetCandidate]:
        """Return the highest confidence candidate."""
        if self.candidates:
            return max(self.candidates, key=lambda c: c.confidence)
        return None


class TargetDetector:
    """
    Detects potential target columns using rule-based heuristics.
    
    HOW IT WORKS:
    -------------
    1. Scan column names for common target patterns
    2. Analyze column characteristics (cardinality, type, missing)
    3. Exclude ID-like and constant columns
    4. Rank candidates by confidence
    
    HOW TO USE:
    -----------
    detector = TargetDetector()
    analysis = detector.detect(df, schema_report)
    
    if analysis.best_candidate:
        print(f"Suggested target: {analysis.best_candidate.column}")
        print(f"Problem type: {analysis.best_candidate.problem_type}")
    
    INDUSTRY CONTEXT:
    -----------------
    In AutoML systems:
    - Google AutoML: User specifies target explicitly
    - H2O Driverless AI: Suggests targets based on column names
    - AWS SageMaker: Analyzes data to recommend problem types
    """
    
    # Common target column name patterns
    TARGET_PATTERNS = [
        "target", "label", "y", "class", "outcome", "result",
        "output", "response", "dependent", "prediction", "predict"
    ]
    
    # Patterns that indicate a column is NOT a target
    EXCLUDE_PATTERNS = [
        "id", "uuid", "key", "index", "row", "timestamp", "created",
        "updated", "modified", "name", "description", "comment"
    ]
    
    def detect(
        self, 
        df: pd.DataFrame, 
        schema_report: Optional[SchemaReport] = None,
        target_column: Optional[str] = None
    ) -> TargetAnalysis:
        """
        Detect potential target columns.
        
        Args:
            df: DataFrame to analyze
            schema_report: Pre-computed schema (optional)
            target_column: If specified, analyze this column specifically
            
        Returns:
            TargetAnalysis with ranked candidates
        """
        candidates = []
        notes = []
        
        # If target explicitly specified, analyze it
        if target_column:
            if target_column in df.columns:
                candidate = self._analyze_target_column(df, target_column)
                candidate.confidence = 1.0  # User specified = full confidence
                candidate.reasons.insert(0, "User-specified target column")
                return TargetAnalysis(
                    candidates=[candidate],
                    unsupervised_suggested=False,
                    notes=["Using user-specified target column"]
                )
            else:
                notes.append(f"Specified target '{target_column}' not found in dataset")
        
        # Scan all columns as potential targets
        for col in df.columns:
            # Get column info
            col_lower = col.lower()
            series = df[col]
            
            # Skip columns that look like IDs
            if self._is_id_like(col, series):
                continue
            
            # Skip constant columns
            if series.nunique() <= 1:
                continue
            
            # Skip columns with too many missing values
            missing_ratio = series.isnull().sum() / len(series)
            if missing_ratio > 0.3:
                continue
            
            # Calculate confidence score
            confidence = self._calculate_confidence(col, series, df)
            
            if confidence > 0.1:
                candidate = self._analyze_target_column(df, col)
                candidate.confidence = confidence
                candidates.append(candidate)
        
        # Sort by confidence
        candidates.sort(key=lambda c: c.confidence, reverse=True)
        
        # Check if unsupervised is suggested
        unsupervised = len(candidates) == 0
        unsupervised_tasks = []
        
        if unsupervised:
            unsupervised_tasks = self._suggest_unsupervised_tasks(df)
            notes.append("No suitable target column found - consider unsupervised learning")
        elif candidates[0].confidence < 0.5:
            notes.append("Target detection has low confidence - please verify selection")
        
        return TargetAnalysis(
            candidates=candidates[:5],  # Top 5 candidates
            unsupervised_suggested=unsupervised,
            unsupervised_tasks=unsupervised_tasks,
            notes=notes
        )
    
    def classify_problem(self, df: pd.DataFrame, target_column: str) -> ProblemType:
        """
        Classify the ML problem type based on the target column.
        
        Args:
            df: DataFrame
            target_column: Name of target column
            
        Returns:
            ProblemType enum value
        """
        if target_column not in df.columns:
            return ProblemType.UNKNOWN
        
        series = df[target_column].dropna()
        unique_count = series.nunique()
        
        # Check for datetime index (time series)
        if df.index.dtype == 'datetime64[ns]' or any(
            pd.api.types.is_datetime64_any_dtype(df[col]) 
            for col in df.columns[:3]
        ):
            if pd.api.types.is_numeric_dtype(series):
                return ProblemType.TIME_SERIES
        
        # Binary classification
        if unique_count == 2:
            return ProblemType.BINARY_CLASSIFICATION
        
        # Multiclass vs Regression
        if pd.api.types.is_numeric_dtype(series):
            if unique_count <= 20:
                # Check if values are integers (likely classes)
                if series.apply(lambda x: float(x).is_integer()).all():
                    return ProblemType.MULTICLASS_CLASSIFICATION
            return ProblemType.REGRESSION
        
        # Categorical target
        if series.dtype == object or pd.api.types.is_categorical_dtype(series):
            if unique_count <= 2:
                return ProblemType.BINARY_CLASSIFICATION
            return ProblemType.MULTICLASS_CLASSIFICATION
        
        return ProblemType.UNKNOWN
    
    def _analyze_target_column(self, df: pd.DataFrame, col: str) -> TargetCandidate:
        """Analyze a specific column as a target."""
        series = df[col]
        reasons = []
        warnings = []
        
        # Determine problem type
        problem_type = self.classify_problem(df, col)
        
        # Analyze characteristics
        unique_count = series.nunique()
        missing_ratio = series.isnull().sum() / len(series)
        
        if missing_ratio > 0:
            warnings.append(f"{missing_ratio:.1%} missing values in target")
        
        if problem_type == ProblemType.BINARY_CLASSIFICATION:
            # Check class balance
            value_counts = series.value_counts(normalize=True)
            if value_counts.min() < 0.1:
                warnings.append(f"Imbalanced classes: minority class is {value_counts.min():.1%}")
            reasons.append(f"Binary target with {unique_count} classes")
            
        elif problem_type == ProblemType.MULTICLASS_CLASSIFICATION:
            reasons.append(f"Multiclass target with {unique_count} classes")
            if unique_count > 50:
                warnings.append(f"High number of classes ({unique_count}) - consider grouping")
                
        elif problem_type == ProblemType.REGRESSION:
            reasons.append(f"Continuous numeric target (range: {series.min():.2f} to {series.max():.2f})")
            skew = series.skew()
            if abs(skew) > 1:
                warnings.append(f"Target is skewed ({skew:.2f}) - consider log transform")
        
        return TargetCandidate(
            column=col,
            confidence=0.5,  # Will be adjusted by caller
            problem_type=problem_type,
            reasons=reasons,
            warnings=warnings
        )
    
    def _is_id_like(self, col_name: str, series: pd.Series) -> bool:
        """Check if column looks like an ID."""
        col_lower = col_name.lower()
        
        # Check name patterns
        for pattern in self.EXCLUDE_PATTERNS:
            if pattern in col_lower:
                return True
        
        # Check characteristics: high unique ratio + sequential
        if series.nunique() / len(series) > 0.95:
            if pd.api.types.is_numeric_dtype(series):
                sorted_vals = series.dropna().sort_values().reset_index(drop=True)
                if len(sorted_vals) > 10:
                    diffs = sorted_vals.diff().dropna()
                    if (diffs == 1).mean() > 0.9:
                        return True
        
        return False
    
    def _calculate_confidence(self, col: str, series: pd.Series, df: pd.DataFrame) -> float:
        """Calculate confidence that this column is a target."""
        confidence = 0.3  # Base confidence
        col_lower = col.lower()
        
        # Boost for target-like names
        for pattern in self.TARGET_PATTERNS:
            if pattern in col_lower:
                confidence += 0.4
                break
        
        # Boost for suitable cardinality
        unique_count = series.nunique()
        if 2 <= unique_count <= 20:
            confidence += 0.2  # Good for classification
        elif unique_count > 20 and pd.api.types.is_numeric_dtype(series):
            confidence += 0.15  # Could be regression
        
        # Penalty for very high cardinality strings (likely IDs)
        if series.dtype == object and series.nunique() / len(series) > 0.5:
            confidence -= 0.3
        
        # Penalty for missing values
        missing_ratio = series.isnull().sum() / len(series)
        confidence -= missing_ratio * 0.5
        
        return max(0, min(1, confidence))
    
    def _suggest_unsupervised_tasks(self, df: pd.DataFrame) -> List[str]:
        """Suggest unsupervised learning tasks."""
        tasks = []
        
        # Clustering if there are reasonable features
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) >= 2:
            tasks.append("Clustering (K-Means, DBSCAN)")
        
        # Anomaly detection
        if len(df) > 100:
            tasks.append("Anomaly Detection (Isolation Forest, One-Class SVM)")
        
        # Dimensionality reduction
        if len(df.columns) > 5:
            tasks.append("Dimensionality Reduction (PCA, t-SNE, UMAP)")
        
        # Association rules if categorical
        cat_cols = df.select_dtypes(include=['object', 'category']).columns
        if len(cat_cols) >= 2:
            tasks.append("Association Rule Mining")
        
        return tasks
