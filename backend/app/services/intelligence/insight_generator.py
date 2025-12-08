"""
Insight Generator
=================

Generates insights from dataset analysis including correlations,
feature importance, and actionable recommendations.

WHY THIS MATTERS:
-----------------
Raw statistics are just numbers. Insights tell a story:
- Which features matter most?
- What patterns exist in the data?
- What should you investigate further?
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any, Tuple

from .schema_analyzer import SchemaReport, InferredType
from .target_detector import ProblemType


@dataclass
class FeatureCorrelation:
    """Correlation between a feature and target."""
    feature: str
    correlation: float
    method: str  # pearson, spearman, mutual_info
    interpretation: str


@dataclass
class FeatureImportance:
    """Feature importance from a model."""
    feature: str
    importance: float
    rank: int


@dataclass
class DatasetInsight:
    """A single insight about the dataset."""
    category: str  # "pattern", "warning", "recommendation", "observation"
    title: str
    description: str
    details: Optional[Dict[str, Any]] = None


@dataclass
class DatasetInsights:
    """
    Complete insights report for a dataset.
    """
    # Correlation analysis
    feature_correlations: List[FeatureCorrelation]
    
    # Feature importance (if computed)
    feature_importances: List[FeatureImportance]
    
    # General insights
    insights: List[DatasetInsight]
    
    # Summary statistics
    summary: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> dict:
        return {
            "feature_correlations": [
                {
                    "feature": fc.feature,
                    "correlation": round(fc.correlation, 4),
                    "method": fc.method,
                    "interpretation": fc.interpretation
                }
                for fc in self.feature_correlations
            ],
            "feature_importances": [
                {
                    "feature": fi.feature,
                    "importance": round(fi.importance, 4),
                    "rank": fi.rank
                }
                for fi in self.feature_importances
            ],
            "insights": [
                {
                    "category": i.category,
                    "title": i.title,
                    "description": i.description,
                    "details": i.details
                }
                for i in self.insights
            ],
            "summary": self.summary
        }


class InsightGenerator:
    """
    Generates insights from dataset analysis.
    
    HOW TO USE:
    -----------
    generator = InsightGenerator()
    insights = generator.generate(df, target_column="price")
    
    for insight in insights.insights:
        print(f"[{insight.category}] {insight.title}")
        print(f"  {insight.description}")
    
    INDUSTRY CONTEXT:
    -----------------
    This is similar to:
    - Auto-generated EDA reports
    - Business intelligence dashboards
    - AutoML explanation features
    """
    
    def generate(
        self, 
        df: pd.DataFrame,
        target_column: Optional[str] = None,
        schema_report: Optional[SchemaReport] = None
    ) -> DatasetInsights:
        """
        Generate comprehensive insights from a dataset.
        
        Args:
            df: DataFrame to analyze
            target_column: Target column for supervised insights
            schema_report: Pre-computed schema (optional)
            
        Returns:
            DatasetInsights with correlations, importance, and observations
        """
        insights = []
        correlations = []
        importances = []
        summary = {}
        
        # Basic summary
        summary["rows"] = len(df)
        summary["columns"] = len(df.columns)
        summary["memory_mb"] = round(df.memory_usage(deep=True).sum() / 1024 / 1024, 2)
        
        # Missing data insight
        missing_pct = df.isnull().sum().sum() / (len(df) * len(df.columns)) * 100
        if missing_pct > 0:
            insights.append(DatasetInsight(
                category="observation",
                title="Missing Data Present",
                description=f"Dataset has {missing_pct:.1f}% missing values overall",
                details={"missing_percentage": missing_pct}
            ))
        
        # Numeric column insights
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        if len(numeric_cols) > 1:
            # Correlation analysis
            corr_insights = self._analyze_correlations(df, numeric_cols)
            insights.extend(corr_insights)
        
        # Target-specific analysis
        if target_column and target_column in df.columns:
            correlations = self._compute_target_correlations(df, target_column)
            
            # Top predictors insight
            top_predictors = [c for c in correlations if abs(c.correlation) > 0.3]
            if top_predictors:
                insights.append(DatasetInsight(
                    category="pattern",
                    title="Strong Feature-Target Relationships",
                    description=f"Found {len(top_predictors)} features with |correlation| > 0.3",
                    details={
                        "top_features": [c.feature for c in top_predictors[:5]]
                    }
                ))
            
            # Class imbalance check (classification)
            if df[target_column].nunique() <= 20:
                imbalance_insight = self._check_class_imbalance(df, target_column)
                if imbalance_insight:
                    insights.append(imbalance_insight)
            
            # Try to compute feature importance
            try:
                importances = self._compute_feature_importance(df, target_column)
            except Exception:
                pass  # Skip if fails
        
        # Categorical column insights
        cat_cols = df.select_dtypes(include=['object', 'category']).columns
        high_cardinality = [c for c in cat_cols if df[c].nunique() > 50]
        
        if high_cardinality:
            insights.append(DatasetInsight(
                category="warning",
                title="High Cardinality Categorical Features",
                description=f"{len(high_cardinality)} categorical columns have >50 unique values",
                details={"columns": high_cardinality}
            ))
        
        # Duplicate detection
        dup_count = df.duplicated().sum()
        if dup_count > 0:
            insights.append(DatasetInsight(
                category="warning",
                title="Duplicate Rows Detected",
                description=f"Found {dup_count} duplicate rows ({dup_count/len(df)*100:.1f}%)",
                details={"count": int(dup_count)}
            ))
        
        # Feature recommendations
        insights.extend(self._generate_recommendations(df, target_column))
        
        return DatasetInsights(
            feature_correlations=correlations,
            feature_importances=importances,
            insights=insights,
            summary=summary
        )
    
    def _analyze_correlations(
        self, 
        df: pd.DataFrame, 
        numeric_cols: List[str]
    ) -> List[DatasetInsight]:
        """Analyze inter-feature correlations."""
        insights = []
        
        corr_matrix = df[numeric_cols].corr()
        
        # Find highly correlated pairs
        high_corr_pairs = []
        for i, col1 in enumerate(numeric_cols):
            for col2 in numeric_cols[i+1:]:
                corr = corr_matrix.loc[col1, col2]
                if abs(corr) > 0.8:
                    high_corr_pairs.append((col1, col2, corr))
        
        if high_corr_pairs:
            insights.append(DatasetInsight(
                category="warning",
                title="Highly Correlated Features",
                description=f"Found {len(high_corr_pairs)} feature pairs with |correlation| > 0.8",
                details={
                    "pairs": [(p[0], p[1], round(p[2], 2)) for p in high_corr_pairs[:5]]
                }
            ))
        
        return insights
    
    def _compute_target_correlations(
        self, 
        df: pd.DataFrame, 
        target_column: str
    ) -> List[FeatureCorrelation]:
        """Compute correlations between features and target."""
        correlations = []
        target = df[target_column]
        
        # Numeric features
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        numeric_cols = [c for c in numeric_cols if c != target_column]
        
        for col in numeric_cols:
            try:
                # Use Spearman for robustness
                corr = df[col].corr(target, method='spearman')
                
                if pd.notna(corr):
                    interpretation = self._interpret_correlation(corr)
                    correlations.append(FeatureCorrelation(
                        feature=col,
                        correlation=float(corr),
                        method="spearman",
                        interpretation=interpretation
                    ))
            except Exception:
                continue
        
        # Sort by absolute correlation
        correlations.sort(key=lambda x: abs(x.correlation), reverse=True)
        
        return correlations
    
    def _interpret_correlation(self, corr: float) -> str:
        """Interpret correlation strength."""
        abs_corr = abs(corr)
        direction = "positive" if corr > 0 else "negative"
        
        if abs_corr > 0.7:
            return f"Strong {direction} relationship"
        elif abs_corr > 0.4:
            return f"Moderate {direction} relationship"
        elif abs_corr > 0.2:
            return f"Weak {direction} relationship"
        else:
            return "Very weak or no linear relationship"
    
    def _check_class_imbalance(
        self, 
        df: pd.DataFrame, 
        target_column: str
    ) -> Optional[DatasetInsight]:
        """Check for class imbalance in classification targets."""
        value_counts = df[target_column].value_counts(normalize=True)
        min_class_pct = value_counts.min() * 100
        
        if min_class_pct < 10:
            return DatasetInsight(
                category="warning",
                title="Class Imbalance Detected",
                description=f"Minority class represents only {min_class_pct:.1f}% of data",
                details={
                    "class_distribution": value_counts.to_dict()
                }
            )
        return None
    
    def _compute_feature_importance(
        self, 
        df: pd.DataFrame, 
        target_column: str
    ) -> List[FeatureImportance]:
        """Compute feature importance using a simple tree model."""
        from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
        from sklearn.preprocessing import LabelEncoder
        
        # Prepare data
        X = df.drop(columns=[target_column])
        y = df[target_column]
        
        # Handle categorical features
        X_encoded = X.copy()
        for col in X.select_dtypes(include=['object', 'category']).columns:
            le = LabelEncoder()
            X_encoded[col] = le.fit_transform(X[col].astype(str))
        
        # Fill missing
        X_encoded = X_encoded.fillna(0)
        
        # Determine model type
        is_classification = y.nunique() <= 20 and not pd.api.types.is_float_dtype(y)
        
        if is_classification:
            y_encoded = LabelEncoder().fit_transform(y.astype(str))
            model = RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1)
        else:
            y_encoded = y
            model = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)
        
        # Fit and extract importance
        model.fit(X_encoded, y_encoded)
        
        importances = []
        for idx, (col, imp) in enumerate(
            sorted(zip(X.columns, model.feature_importances_), key=lambda x: x[1], reverse=True)
        ):
            importances.append(FeatureImportance(
                feature=col,
                importance=float(imp),
                rank=idx + 1
            ))
        
        return importances
    
    def _generate_recommendations(
        self, 
        df: pd.DataFrame, 
        target_column: Optional[str]
    ) -> List[DatasetInsight]:
        """Generate actionable recommendations."""
        recommendations = []
        
        # Size-based recommendations
        if len(df) < 100:
            recommendations.append(DatasetInsight(
                category="recommendation",
                title="Small Dataset",
                description="Consider collecting more data or using cross-validation to avoid overfitting"
            ))
        elif len(df) > 100000:
            recommendations.append(DatasetInsight(
                category="recommendation",
                title="Large Dataset",
                description="Consider sampling for EDA and using efficient algorithms for training"
            ))
        
        # Feature count recommendations
        if len(df.columns) > 50:
            recommendations.append(DatasetInsight(
                category="recommendation",
                title="Many Features",
                description="Consider feature selection or dimensionality reduction (PCA, feature importance)"
            ))
        
        return recommendations
