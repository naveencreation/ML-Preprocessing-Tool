"""
Metrics Advisor
===============

Recommends appropriate evaluation metrics based on problem type.

WHY THIS MATTERS:
-----------------
Using the wrong metric can lead to:
- Optimizing for the wrong objective
- Misleading model comparisons
- Poor real-world performance

This module recommends metrics with explanations of when to use each.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Callable
from enum import Enum

from .target_detector import ProblemType


class MetricCategory(str, Enum):
    """Categories of evaluation metrics."""
    PRIMARY = "primary"      # Main metric to optimize
    SECONDARY = "secondary"  # Additional important metrics
    OPTIONAL = "optional"    # Nice to track but not critical


@dataclass
class MetricRecommendation:
    """
    A recommended metric with explanation.
    """
    name: str
    category: MetricCategory
    description: str
    when_to_use: str
    when_not_to_use: str
    sklearn_name: Optional[str] = None  # For sklearn.metrics
    
    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "category": self.category.value,
            "description": self.description,
            "when_to_use": self.when_to_use,
            "when_not_to_use": self.when_not_to_use,
            "sklearn_name": self.sklearn_name
        }


@dataclass
class MetricsAdvice:
    """
    Complete metrics advice for a problem type.
    """
    problem_type: ProblemType
    primary_metric: str
    all_metrics: List[MetricRecommendation]
    notes: List[str] = field(default_factory=list)
    
    def to_dict(self) -> dict:
        return {
            "problem_type": self.problem_type.value,
            "primary_metric": self.primary_metric,
            "metrics": [m.to_dict() for m in self.all_metrics],
            "notes": self.notes
        }


class MetricsAdvisor:
    """
    Recommends evaluation metrics based on problem type.
    
    HOW TO USE:
    -----------
    advisor = MetricsAdvisor()
    advice = advisor.recommend(ProblemType.BINARY_CLASSIFICATION)
    
    print(f"Primary metric: {advice.primary_metric}")
    for metric in advice.all_metrics:
        print(f"- {metric.name}: {metric.description}")
    
    INDUSTRY CONTEXT:
    -----------------
    Metric selection is crucial in production:
    - Kaggle competitions: Often use specific metrics like AUC or Log Loss
    - Business KPIs: May require custom metrics (revenue, churn)
    - Imbalanced data: Accuracy is misleading, use F1 or PR-AUC
    """
    
    # Metric definitions by problem type
    METRICS = {
        ProblemType.BINARY_CLASSIFICATION: [
            MetricRecommendation(
                name="ROC-AUC",
                category=MetricCategory.PRIMARY,
                description="Area Under the ROC Curve - measures discrimination ability",
                when_to_use="General binary classification, when you care about ranking",
                when_not_to_use="Heavily imbalanced datasets (use PR-AUC instead)",
                sklearn_name="roc_auc_score"
            ),
            MetricRecommendation(
                name="F1-Score",
                category=MetricCategory.PRIMARY,
                description="Harmonic mean of precision and recall",
                when_to_use="Imbalanced datasets, when both false positives and negatives matter",
                when_not_to_use="When precision or recall is clearly more important",
                sklearn_name="f1_score"
            ),
            MetricRecommendation(
                name="Precision",
                category=MetricCategory.SECONDARY,
                description="True positives / (True positives + False positives)",
                when_to_use="When false positives are costly (spam detection)",
                when_not_to_use="When missing positives is worse than false alarms",
                sklearn_name="precision_score"
            ),
            MetricRecommendation(
                name="Recall",
                category=MetricCategory.SECONDARY,
                description="True positives / (True positives + False negatives)",
                when_to_use="When missing positives is costly (disease detection)",
                when_not_to_use="When false alarms are problematic",
                sklearn_name="recall_score"
            ),
            MetricRecommendation(
                name="PR-AUC",
                category=MetricCategory.SECONDARY,
                description="Area Under Precision-Recall Curve",
                when_to_use="Imbalanced datasets, rare event detection",
                when_not_to_use="Balanced datasets (ROC-AUC is more standard)",
                sklearn_name="average_precision_score"
            ),
            MetricRecommendation(
                name="Accuracy",
                category=MetricCategory.OPTIONAL,
                description="Correct predictions / Total predictions",
                when_to_use="Balanced datasets, simple reporting",
                when_not_to_use="Imbalanced datasets - can be misleading!",
                sklearn_name="accuracy_score"
            ),
        ],
        
        ProblemType.MULTICLASS_CLASSIFICATION: [
            MetricRecommendation(
                name="Macro F1-Score",
                category=MetricCategory.PRIMARY,
                description="Average F1-score across all classes (unweighted)",
                when_to_use="When all classes are equally important",
                when_not_to_use="When class frequency should influence scoring",
                sklearn_name="f1_score"
            ),
            MetricRecommendation(
                name="Weighted F1-Score",
                category=MetricCategory.PRIMARY,
                description="F1-score weighted by class frequency",
                when_to_use="Imbalanced classes where majority matters more",
                when_not_to_use="When rare classes are more important",
                sklearn_name="f1_score"
            ),
            MetricRecommendation(
                name="Accuracy",
                category=MetricCategory.SECONDARY,
                description="Overall correct predictions",
                when_to_use="Balanced classes, quick overview",
                when_not_to_use="Imbalanced multiclass problems",
                sklearn_name="accuracy_score"
            ),
            MetricRecommendation(
                name="Confusion Matrix",
                category=MetricCategory.SECONDARY,
                description="Detailed breakdown of predictions per class",
                when_to_use="Understanding per-class performance",
                when_not_to_use="Need single number metric",
                sklearn_name="confusion_matrix"
            ),
        ],
        
        ProblemType.REGRESSION: [
            MetricRecommendation(
                name="RMSE",
                category=MetricCategory.PRIMARY,
                description="Root Mean Squared Error - penalizes large errors",
                when_to_use="When large errors are particularly bad",
                when_not_to_use="When outliers shouldn't dominate the metric",
                sklearn_name="mean_squared_error"
            ),
            MetricRecommendation(
                name="MAE",
                category=MetricCategory.PRIMARY,
                description="Mean Absolute Error - robust to outliers",
                when_to_use="When errors are equally bad regardless of magnitude",
                when_not_to_use="When large errors should be penalized more",
                sklearn_name="mean_absolute_error"
            ),
            MetricRecommendation(
                name="R² Score",
                category=MetricCategory.SECONDARY,
                description="Coefficient of determination - variance explained",
                when_to_use="Comparing models, understanding fit quality",
                when_not_to_use="Can be misleading with many features",
                sklearn_name="r2_score"
            ),
            MetricRecommendation(
                name="MAPE",
                category=MetricCategory.OPTIONAL,
                description="Mean Absolute Percentage Error",
                when_to_use="When relative error matters more than absolute",
                when_not_to_use="When target contains zeros or near-zeros",
                sklearn_name=None  # Not in sklearn
            ),
        ],
        
        ProblemType.CLUSTERING: [
            MetricRecommendation(
                name="Silhouette Score",
                category=MetricCategory.PRIMARY,
                description="Measures cluster cohesion and separation (-1 to 1)",
                when_to_use="Evaluating cluster quality without ground truth",
                when_not_to_use="Non-convex clusters (DBSCAN-based)",
                sklearn_name="silhouette_score"
            ),
            MetricRecommendation(
                name="Davies-Bouldin Index",
                category=MetricCategory.SECONDARY,
                description="Lower is better - measures cluster similarity",
                when_to_use="Comparing different numbers of clusters",
                when_not_to_use="Non-spherical clusters",
                sklearn_name="davies_bouldin_score"
            ),
            MetricRecommendation(
                name="Calinski-Harabasz Index",
                category=MetricCategory.SECONDARY,
                description="Higher is better - ratio of between/within cluster dispersion",
                when_to_use="Dense, well-separated clusters",
                when_not_to_use="Irregular cluster shapes",
                sklearn_name="calinski_harabasz_score"
            ),
        ],
        
        ProblemType.TIME_SERIES: [
            MetricRecommendation(
                name="RMSE",
                category=MetricCategory.PRIMARY,
                description="Root Mean Squared Error for forecast accuracy",
                when_to_use="General forecasting, penalize large errors",
                when_not_to_use="When scale varies across series",
                sklearn_name="mean_squared_error"
            ),
            MetricRecommendation(
                name="MAPE",
                category=MetricCategory.PRIMARY,
                description="Mean Absolute Percentage Error",
                when_to_use="Comparing across different scales",
                when_not_to_use="Values close to or crossing zero",
                sklearn_name=None
            ),
            MetricRecommendation(
                name="SMAPE",
                category=MetricCategory.SECONDARY,
                description="Symmetric MAPE - bounded between 0% and 200%",
                when_to_use="More stable than MAPE near zero",
                when_not_to_use="Theoretical interpretability needed",
                sklearn_name=None
            ),
        ],
    }
    
    def recommend(
        self, 
        problem_type: ProblemType,
        is_imbalanced: bool = False,
        custom_context: Optional[str] = None
    ) -> MetricsAdvice:
        """
        Get metric recommendations for a problem type.
        
        Args:
            problem_type: The ML problem type
            is_imbalanced: Whether classes/data is imbalanced
            custom_context: Optional business context
            
        Returns:
            MetricsAdvice with ranked metrics and explanations
        """
        metrics = self.METRICS.get(problem_type, [])
        notes = []
        
        if not metrics:
            return MetricsAdvice(
                problem_type=problem_type,
                primary_metric="N/A",
                all_metrics=[],
                notes=["No standard metrics defined for this problem type"]
            )
        
        # Adjust for imbalanced data
        if is_imbalanced:
            notes.append("⚠️ Imbalanced data detected - avoid relying solely on accuracy")
            if problem_type == ProblemType.BINARY_CLASSIFICATION:
                notes.append("Consider PR-AUC over ROC-AUC for rare events")
        
        # Find primary metric
        primary = next(
            (m for m in metrics if m.category == MetricCategory.PRIMARY),
            metrics[0] if metrics else None
        )
        
        return MetricsAdvice(
            problem_type=problem_type,
            primary_metric=primary.name if primary else "N/A",
            all_metrics=metrics,
            notes=notes
        )
    
    def get_metric_code(self, metric_name: str) -> Optional[str]:
        """
        Get Python code snippet for computing a metric.
        
        Useful for code generation and education.
        """
        snippets = {
            "accuracy": "from sklearn.metrics import accuracy_score\naccuracy = accuracy_score(y_true, y_pred)",
            "f1": "from sklearn.metrics import f1_score\nf1 = f1_score(y_true, y_pred)",
            "roc-auc": "from sklearn.metrics import roc_auc_score\nauc = roc_auc_score(y_true, y_prob)",
            "rmse": "from sklearn.metrics import mean_squared_error\nrmse = mean_squared_error(y_true, y_pred, squared=False)",
            "mae": "from sklearn.metrics import mean_absolute_error\nmae = mean_absolute_error(y_true, y_pred)",
            "r²": "from sklearn.metrics import r2_score\nr2 = r2_score(y_true, y_pred)",
        }
        
        return snippets.get(metric_name.lower())
