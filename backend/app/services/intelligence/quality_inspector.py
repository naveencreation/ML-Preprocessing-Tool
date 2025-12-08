"""
Quality Inspector
=================

Analyzes data quality and provides actionable recommendations.
Extends basic EDA with intelligent preprocessing suggestions.

WHY THIS MATTERS:
-----------------
Data quality directly impacts model performance. This module:
- Identifies issues (missing data, outliers, duplicates)
- Suggests specific handling strategies
- Prioritizes issues by impact
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from enum import Enum

from .schema_analyzer import SchemaReport, ColumnProfile, InferredType


class ImputationStrategy(str, Enum):
    """Recommended imputation strategies."""
    DROP_COLUMN = "drop_column"
    DROP_ROWS = "drop_rows"
    FILL_MEAN = "fill_mean"
    FILL_MEDIAN = "fill_median"
    FILL_MODE = "fill_mode"
    FILL_CONSTANT = "fill_constant"
    KNN_IMPUTE = "knn_impute"
    ITERATIVE_IMPUTE = "iterative_impute"
    FORWARD_FILL = "forward_fill"


class OutlierStrategy(str, Enum):
    """Recommended outlier handling strategies."""
    KEEP = "keep"
    DROP = "drop"
    CAP_IQR = "cap_iqr"
    CAP_PERCENTILE = "cap_percentile"
    LOG_TRANSFORM = "log_transform"


@dataclass
class MissingAnalysis:
    """Analysis of missing values for a column."""
    column: str
    missing_count: int
    missing_ratio: float
    recommended_strategy: ImputationStrategy
    strategy_reason: str


@dataclass
class OutlierAnalysis:
    """Analysis of outliers for a column."""
    column: str
    outlier_count: int
    outlier_ratio: float
    recommended_strategy: OutlierStrategy
    strategy_reason: str


@dataclass
class QualityIssue:
    """A detected quality issue with severity."""
    issue_type: str
    column: Optional[str]
    severity: str  # "low", "medium", "high", "critical"
    description: str
    recommendation: str


@dataclass
class QualityReport:
    """
    Comprehensive data quality report.
    
    Provides actionable insights for data cleaning.
    """
    # Summary stats
    row_count: int
    column_count: int
    duplicate_row_count: int
    duplicate_ratio: float
    total_missing_cells: int
    overall_missing_ratio: float
    
    # Detailed analyses
    missing_analysis: List[MissingAnalysis]
    outlier_analysis: List[OutlierAnalysis]
    quality_issues: List[QualityIssue]
    
    # Priority columns (need attention)
    high_priority_columns: List[str] = field(default_factory=list)
    
    # Overall quality score (0-100)
    quality_score: int = 100
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "row_count": self.row_count,
            "column_count": self.column_count,
            "duplicate_row_count": self.duplicate_row_count,
            "duplicate_ratio": round(self.duplicate_ratio, 4),
            "total_missing_cells": self.total_missing_cells,
            "overall_missing_ratio": round(self.overall_missing_ratio, 4),
            "missing_analysis": [
                {
                    "column": m.column,
                    "missing_count": m.missing_count,
                    "missing_ratio": round(m.missing_ratio, 4),
                    "recommended_strategy": m.recommended_strategy.value,
                    "strategy_reason": m.strategy_reason
                }
                for m in self.missing_analysis
            ],
            "outlier_analysis": [
                {
                    "column": o.column,
                    "outlier_count": o.outlier_count,
                    "outlier_ratio": round(o.outlier_ratio, 4),
                    "recommended_strategy": o.recommended_strategy.value,
                    "strategy_reason": o.strategy_reason
                }
                for o in self.outlier_analysis
            ],
            "quality_issues": [
                {
                    "issue_type": q.issue_type,
                    "column": q.column,
                    "severity": q.severity,
                    "description": q.description,
                    "recommendation": q.recommendation
                }
                for q in self.quality_issues
            ],
            "high_priority_columns": self.high_priority_columns,
            "quality_score": self.quality_score
        }


class QualityInspector:
    """
    Inspects data quality and provides actionable recommendations.
    
    HOW TO USE:
    -----------
    inspector = QualityInspector()
    report = inspector.inspect(df, schema_report)
    
    # Check issues
    for issue in report.quality_issues:
        print(f"[{issue.severity}] {issue.description}")
    
    INDUSTRY CONTEXT:
    -----------------
    Data quality checks are critical in production ML:
    - Great Expectations: data validation framework
    - dbt tests: data pipeline testing
    - Model monitoring: detecting data drift
    """
    
    # Thresholds
    MISSING_DROP_COLUMN_THRESHOLD = 0.7  # Drop column if >70% missing
    MISSING_DROP_ROWS_THRESHOLD = 0.01   # Drop rows if <1% affected
    HIGH_OUTLIER_THRESHOLD = 0.05        # >5% outliers = high
    
    def inspect(
        self, 
        df: pd.DataFrame, 
        schema_report: Optional[SchemaReport] = None
    ) -> QualityReport:
        """
        Perform comprehensive quality inspection.
        
        Args:
            df: DataFrame to inspect
            schema_report: Pre-computed schema (optional, will compute if not provided)
            
        Returns:
            QualityReport with issues and recommendations
        """
        issues = []
        missing_analyses = []
        outlier_analyses = []
        high_priority = []
        
        # Duplicate analysis
        duplicate_count = df.duplicated().sum()
        duplicate_ratio = duplicate_count / len(df) if len(df) > 0 else 0
        
        if duplicate_ratio > 0.01:
            severity = "high" if duplicate_ratio > 0.1 else "medium"
            issues.append(QualityIssue(
                issue_type="duplicates",
                column=None,
                severity=severity,
                description=f"{duplicate_count} duplicate rows ({duplicate_ratio:.1%})",
                recommendation="Consider removing duplicates with df.drop_duplicates()"
            ))
        
        # Missing value analysis
        total_cells = len(df) * len(df.columns)
        total_missing = df.isnull().sum().sum()
        overall_missing_ratio = total_missing / total_cells if total_cells > 0 else 0
        
        for col in df.columns:
            missing_count = df[col].isnull().sum()
            if missing_count > 0:
                missing_ratio = missing_count / len(df)
                strategy, reason = self._recommend_imputation(df, col, missing_ratio)
                
                missing_analyses.append(MissingAnalysis(
                    column=col,
                    missing_count=int(missing_count),
                    missing_ratio=missing_ratio,
                    recommended_strategy=strategy,
                    strategy_reason=reason
                ))
                
                if missing_ratio > 0.1:
                    high_priority.append(col)
                    severity = "critical" if missing_ratio > 0.5 else "high"
                    issues.append(QualityIssue(
                        issue_type="missing_values",
                        column=col,
                        severity=severity,
                        description=f"{missing_count} missing values ({missing_ratio:.1%})",
                        recommendation=f"{strategy.value}: {reason}"
                    ))
        
        # Outlier analysis (numeric columns only)
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            non_null = df[col].dropna()
            if len(non_null) < 10:
                continue
                
            Q1, Q3 = non_null.quantile([0.25, 0.75])
            IQR = Q3 - Q1
            outlier_mask = (non_null < (Q1 - 1.5 * IQR)) | (non_null > (Q3 + 1.5 * IQR))
            outlier_count = outlier_mask.sum()
            
            if outlier_count > 0:
                outlier_ratio = outlier_count / len(non_null)
                strategy, reason = self._recommend_outlier_handling(outlier_ratio, non_null)
                
                outlier_analyses.append(OutlierAnalysis(
                    column=col,
                    outlier_count=int(outlier_count),
                    outlier_ratio=outlier_ratio,
                    recommended_strategy=strategy,
                    strategy_reason=reason
                ))
                
                if outlier_ratio > self.HIGH_OUTLIER_THRESHOLD:
                    high_priority.append(col)
                    issues.append(QualityIssue(
                        issue_type="outliers",
                        column=col,
                        severity="medium",
                        description=f"{outlier_count} outliers ({outlier_ratio:.1%})",
                        recommendation=f"{strategy.value}: {reason}"
                    ))
        
        # Constant columns
        for col in df.columns:
            if df[col].nunique() <= 1:
                issues.append(QualityIssue(
                    issue_type="constant_column",
                    column=col,
                    severity="medium",
                    description="Column has only one unique value",
                    recommendation="Drop this column - provides no information"
                ))
        
        # Calculate quality score
        quality_score = self._calculate_quality_score(
            duplicate_ratio, overall_missing_ratio, 
            len(issues), len(df.columns)
        )
        
        return QualityReport(
            row_count=len(df),
            column_count=len(df.columns),
            duplicate_row_count=int(duplicate_count),
            duplicate_ratio=duplicate_ratio,
            total_missing_cells=int(total_missing),
            overall_missing_ratio=overall_missing_ratio,
            missing_analysis=missing_analyses,
            outlier_analysis=outlier_analyses,
            quality_issues=issues,
            high_priority_columns=list(set(high_priority)),
            quality_score=quality_score
        )
    
    def _recommend_imputation(
        self, 
        df: pd.DataFrame, 
        col: str, 
        missing_ratio: float
    ) -> tuple[ImputationStrategy, str]:
        """Recommend imputation strategy based on column characteristics."""
        
        if missing_ratio > self.MISSING_DROP_COLUMN_THRESHOLD:
            return ImputationStrategy.DROP_COLUMN, "Too many missing values (>70%)"
        
        if missing_ratio < self.MISSING_DROP_ROWS_THRESHOLD:
            return ImputationStrategy.DROP_ROWS, "Very few missing (<1% of rows)"
        
        dtype = df[col].dtype
        
        if pd.api.types.is_numeric_dtype(dtype):
            # Check for skewness
            non_null = df[col].dropna()
            if len(non_null) > 10:
                skew = non_null.skew()
                if abs(skew) > 1:
                    return ImputationStrategy.FILL_MEDIAN, "Skewed distribution - median is robust"
            return ImputationStrategy.FILL_MEAN, "Numeric column - mean preserves distribution"
        
        return ImputationStrategy.FILL_MODE, "Categorical column - mode is most common"
    
    def _recommend_outlier_handling(
        self, 
        outlier_ratio: float, 
        series: pd.Series
    ) -> tuple[OutlierStrategy, str]:
        """Recommend outlier handling strategy."""
        
        if outlier_ratio < 0.01:
            return OutlierStrategy.DROP, "Few outliers - safe to remove"
        
        if outlier_ratio > 0.1:
            # Many outliers might indicate natural variation
            skew = series.skew()
            if skew > 2:
                return OutlierStrategy.LOG_TRANSFORM, "Right-skewed - log transform may help"
            return OutlierStrategy.CAP_PERCENTILE, "Many outliers - cap at 5th/95th percentile"
        
        return OutlierStrategy.CAP_IQR, "Moderate outliers - cap using IQR method"
    
    def _calculate_quality_score(
        self, 
        dup_ratio: float, 
        missing_ratio: float,
        issue_count: int, 
        col_count: int
    ) -> int:
        """Calculate overall quality score (0-100)."""
        score = 100
        
        # Deduct for duplicates
        score -= min(20, int(dup_ratio * 100))
        
        # Deduct for missing values
        score -= min(30, int(missing_ratio * 150))
        
        # Deduct for issues relative to column count
        issue_penalty = min(30, int(issue_count / max(1, col_count) * 50))
        score -= issue_penalty
        
        return max(0, score)
