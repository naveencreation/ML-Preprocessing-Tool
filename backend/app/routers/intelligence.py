"""
Intelligence API Router
=======================

API endpoints for the Dataset Intelligence Engine.
Provides schema analysis, quality inspection, target detection,
metrics recommendations, and LLM-powered guidance.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import pandas as pd
import os
from typing import Optional

from app.database import get_db
from app import models
from app.services.intelligence import (
    SchemaAnalyzer,
    QualityInspector, 
    TargetDetector,
    MetricsAdvisor,
    InsightGenerator,
    LLMAdvisor,
)
from app.utils.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/intelligence",
    tags=["intelligence"]
)


@router.get("/debug/env")
def debug_env():
    """Debug endpoint to check environment variables."""
    key = os.environ.get("GEMINI_API_KEY")
    advisor = LLMAdvisor()
    return {
        "gemini_api_key_in_env": key[:20] + "..." if key else "NOT SET",
        "llm_advisor_api_key": advisor.api_key[:20] + "..." if advisor.api_key else "NOT SET",
        "is_available": advisor.is_available(),
        "provider": advisor.provider.value,
        "client_exists": advisor._client is not None
    }


def get_dataframe(dataset_id: int, db: Session) -> pd.DataFrame:
    """Load dataset as DataFrame."""
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    if dataset.dataset_type != "tabular":
        raise HTTPException(
            status_code=400, 
            detail=f"Intelligence engine only supports tabular datasets, got: {dataset.dataset_type}"
        )
    
    try:
        return pd.read_csv(dataset.filepath)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading dataset: {str(e)}")


@router.get("/{dataset_id}/schema")
def get_schema_analysis(dataset_id: int, db: Session = Depends(get_db)):
    """
    Get comprehensive schema analysis for a dataset.
    
    Returns column profiles with:
    - Data types (inferred semantic types)
    - Statistics (for numeric columns)
    - Cardinality and missing value info
    - Quality flags (constant, ID-like, high-cardinality)
    - Preprocessing hints
    """
    logger.info(f"Schema analysis requested for dataset {dataset_id}")
    df = get_dataframe(dataset_id, db)
    
    analyzer = SchemaAnalyzer()
    report = analyzer.analyze(df)
    
    return report.to_dict()


@router.get("/{dataset_id}/quality")
def get_quality_report(dataset_id: int, db: Session = Depends(get_db)):
    """
    Get data quality report with recommendations.
    
    Returns:
    - Missing value analysis with imputation suggestions
    - Outlier analysis with handling suggestions
    - Quality issues and severity
    - Overall quality score
    """
    logger.info(f"Quality inspection requested for dataset {dataset_id}")
    df = get_dataframe(dataset_id, db)
    
    inspector = QualityInspector()
    report = inspector.inspect(df)
    
    return report.to_dict()


@router.get("/{dataset_id}/targets")
def detect_targets(
    dataset_id: int, 
    target: Optional[str] = Query(None, description="Specify target column explicitly"),
    db: Session = Depends(get_db)
):
    """
    Detect potential target columns and classify problem type.
    
    Returns:
    - Ranked target candidates with confidence scores
    - Problem type for each candidate (classification/regression/etc)
    - Reasoning for suggestions
    - Unsupervised task suggestions if no target found
    """
    logger.info(f"Target detection requested for dataset {dataset_id}")
    df = get_dataframe(dataset_id, db)
    
    detector = TargetDetector()
    analysis = detector.detect(df, target_column=target)
    
    return analysis.to_dict()


@router.get("/{dataset_id}/metrics")
def get_metrics_advice(
    dataset_id: int,
    target: str = Query(..., description="Target column name"),
    db: Session = Depends(get_db)
):
    """
    Get metric recommendations for the detected problem type.
    
    Returns:
    - Problem type classification
    - Primary recommended metric
    - All relevant metrics with explanations
    - Usage guidance (when to use, when not to use)
    """
    logger.info(f"Metrics advice requested for dataset {dataset_id}, target: {target}")
    df = get_dataframe(dataset_id, db)
    
    if target not in df.columns:
        raise HTTPException(status_code=400, detail=f"Target column '{target}' not found")
    
    # Detect problem type
    detector = TargetDetector()
    problem_type = detector.classify_problem(df, target)
    
    # Check for imbalance
    is_imbalanced = False
    if df[target].nunique() <= 20:
        value_counts = df[target].value_counts(normalize=True)
        is_imbalanced = value_counts.min() < 0.1
    
    advisor = MetricsAdvisor()
    advice = advisor.recommend(problem_type, is_imbalanced=is_imbalanced)
    
    return advice.to_dict()


@router.get("/{dataset_id}/insights")
def get_insights(
    dataset_id: int,
    target: Optional[str] = Query(None, description="Target column for supervised insights"),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive dataset insights.
    
    Returns:
    - Feature-target correlations
    - Feature importance (if target specified)
    - Data patterns and observations
    - Actionable recommendations
    """
    logger.info(f"Insights requested for dataset {dataset_id}")
    df = get_dataframe(dataset_id, db)
    
    if target and target not in df.columns:
        raise HTTPException(status_code=400, detail=f"Target column '{target}' not found")
    
    generator = InsightGenerator()
    insights = generator.generate(df, target_column=target)
    
    return insights.to_dict()


@router.get("/{dataset_id}/full-analysis")
def get_full_analysis(
    dataset_id: int,
    target: Optional[str] = Query(None, description="Target column"),
    db: Session = Depends(get_db)
):
    """
    Get complete intelligence analysis in one call.
    
    Returns all of: schema, quality, targets, metrics, and insights.
    """
    logger.info(f"Full analysis requested for dataset {dataset_id}")
    df = get_dataframe(dataset_id, db)
    
    # Schema
    schema_analyzer = SchemaAnalyzer()
    schema = schema_analyzer.analyze(df)
    
    # Quality
    quality_inspector = QualityInspector()
    quality = quality_inspector.inspect(df, schema)
    
    # Target detection
    target_detector = TargetDetector()
    targets = target_detector.detect(df, target_column=target)
    
    # Use best candidate if no target specified
    effective_target = target
    if not effective_target and targets.best_candidate:
        effective_target = targets.best_candidate.column
    
    # Metrics (if we have a target)
    metrics = None
    if effective_target:
        problem_type = target_detector.classify_problem(df, effective_target)
        metrics_advisor = MetricsAdvisor()
        metrics = metrics_advisor.recommend(problem_type)
    
    # Insights
    insight_generator = InsightGenerator()
    insights = insight_generator.generate(df, target_column=effective_target)
    
    return {
        "schema": schema.to_dict(),
        "quality": quality.to_dict(),
        "targets": targets.to_dict(),
        "metrics": metrics.to_dict() if metrics else None,
        "insights": insights.to_dict(),
        "effective_target": effective_target
    }


@router.post("/{dataset_id}/ask")
def ask_about_dataset(
    dataset_id: int,
    question: str,
    db: Session = Depends(get_db)
):
    """
    Ask a question about the dataset using LLM.
    
    Requires GEMINI_API_KEY environment variable.
    Returns LLM-generated answer with dataset context.
    """
    logger.info(f"LLM question for dataset {dataset_id}: {question[:50]}...")
    df = get_dataframe(dataset_id, db)
    
    advisor = LLMAdvisor()
    
    if not advisor.is_available():
        return {
            "success": False,
            "error": "LLM not available. Set GEMINI_API_KEY environment variable.",
            "suggestion": None
        }
    
    context = {
        "row_count": len(df),
        "columns": df.columns.tolist(),
        "target": None,
        "problem_type": "unknown"
    }
    
    response = advisor.answer_question(question, context)
    
    return {
        "success": response.success,
        "answer": response.suggestion.content if response.suggestion else None,
        "error": response.error,
        "provider": response.provider
    }
