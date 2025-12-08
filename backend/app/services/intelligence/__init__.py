"""
Dataset Intelligence Engine
============================

A modular system for analyzing datasets, detecting problem types,
recommending metrics, and providing ML guidance.

Modules:
- SchemaAnalyzer: Deep column profiling
- QualityInspector: Data quality analysis
- TargetDetector: Target column + problem type detection
- MetricsAdvisor: Problem-aware metric recommendations
- InsightGenerator: Feature analysis and insights
- LLMAdvisor: Optional Gemini integration
"""

from .schema_analyzer import SchemaAnalyzer, SchemaReport, ColumnProfile, InferredType
from .quality_inspector import QualityInspector, QualityReport, ImputationStrategy, OutlierStrategy
from .target_detector import TargetDetector, TargetCandidate, TargetAnalysis, ProblemType
from .metrics_advisor import MetricsAdvisor, MetricsAdvice, MetricRecommendation
from .insight_generator import InsightGenerator, DatasetInsights
from .llm_advisor import LLMAdvisor, LLMResponse

__all__ = [
    # Schema
    "SchemaAnalyzer", "SchemaReport", "ColumnProfile", "InferredType",
    # Quality
    "QualityInspector", "QualityReport", "ImputationStrategy", "OutlierStrategy",
    # Target
    "TargetDetector", "TargetCandidate", "TargetAnalysis", "ProblemType",
    # Metrics
    "MetricsAdvisor", "MetricsAdvice", "MetricRecommendation",
    # Insights
    "InsightGenerator", "DatasetInsights",
    # LLM
    "LLMAdvisor", "LLMResponse",
]
