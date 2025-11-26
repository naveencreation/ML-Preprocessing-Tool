from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
from app.database import get_db
from app import models
from app.services import eda_service

router = APIRouter(
    prefix="/eda",
    tags=["eda"]
)

def get_dataframe(dataset_id: int, db: Session):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        return pd.read_csv(dataset.filepath)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Dataset file not found on server")
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="Dataset file is empty")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

@router.get("/{dataset_id}/stats")
def get_stats(dataset_id: int, db: Session = Depends(get_db)):
    df = get_dataframe(dataset_id, db)
    return {
        "basic_info": eda_service.get_basic_info(df),
        "summary": eda_service.get_summary_statistics(df),
        "missing": eda_service.get_missing_values(df),
        "categorical": eda_service.get_categorical_uniques(df)
    }

@router.get("/{dataset_id}/histogram")
def get_histogram(dataset_id: int, column: str, db: Session = Depends(get_db)):
    df = get_dataframe(dataset_id, db)
    if column not in df.columns:
        raise HTTPException(status_code=400, detail="Column not found")
    return eda_service.generate_histogram(df, column)

@router.get("/{dataset_id}/boxplot")
def get_boxplot(dataset_id: int, column: str, db: Session = Depends(get_db)):
    df = get_dataframe(dataset_id, db)
    if column not in df.columns:
        raise HTTPException(status_code=400, detail="Column not found")
    return eda_service.generate_boxplot(df, column)

@router.get("/{dataset_id}/correlation")
def get_correlation(dataset_id: int, db: Session = Depends(get_db)):
    df = get_dataframe(dataset_id, db)
    return eda_service.generate_correlation_matrix(df)

@router.get("/{dataset_id}/quality-report")
def get_quality_report(dataset_id: int, db: Session = Depends(get_db)):
    df = get_dataframe(dataset_id, db)
    return eda_service.get_quality_report(df)

@router.get("/{dataset_id}/insights")
def get_smart_insights(dataset_id: int, db: Session = Depends(get_db)):
    """
    Generate smart insights about the dataset including:
    - Missing value analysis
    - Data type composition
    - Skewness and kurtosis for numeric columns
    - High cardinality detection for categorical columns
    - Multicollinearity warnings
    """
    df = get_dataframe(dataset_id, db)
    
    insights = []
    
    # 1. Missing Values Insight
    missing = df.isnull().sum()
    missing_cols = missing[missing > 0]
    total_rows = len(df)
    
    if len(missing_cols) > 0:
        top_missing_col = missing_cols.idxmax()
        top_missing_pct = (missing_cols[top_missing_col] / total_rows) * 100
        insights.append({
            "type": "warning",
            "category": "data_quality",
            "title": "Missing Data Detected",
            "description": f"{len(missing_cols)} columns have missing values. '{top_missing_col}' has {top_missing_pct:.1f}% missing.",
            "severity": "high" if top_missing_pct > 20 else "medium",
            "action": "Consider imputation or dropping rows/columns with excessive missing values."
        })
    else:
        insights.append({
            "type": "success",
            "category": "data_quality",
            "title": "Complete Dataset",
            "description": "No missing values detected. Your dataset is complete!",
            "severity": "info"
        })
    
    # 2. Data Type Distribution
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns
    
    insights.append({
        "type": "info",
        "category": "structure",
        "title": "Feature Composition",
        "description": f"Dataset contains {len(numeric_cols)} numeric and {len(categorical_cols)} categorical features.",
        "severity": "info",
        "details": {
            "numeric_count": len(numeric_cols),
            "categorical_count": len(categorical_cols)
        }
    })
    
    # 3. Skewness Analysis (for numeric columns)
    if len(numeric_cols) > 0:
        skewness = df[numeric_cols].skew()
        highly_skewed = skewness[abs(skewness) > 1]
        
        if len(highly_skewed) > 0:
            insights.append({
                "type": "warning",
                "category": "distribution",
                "title": "Skewed Distributions Detected",
                "description": f"{len(highly_skewed)} numeric features are highly skewed. Consider log transformation or scaling.",
                "severity": "medium",
                "details": {
                    "skewed_features": highly_skewed.to_dict()
                },
                "action": "Apply log transformation, sqrt transformation, or robust scaling methods."
            })
    
    # 4. High Cardinality Detection
    if len(categorical_cols) > 0:
        high_card_cols = []
        for col in categorical_cols:
            unique_count = df[col].nunique()
            unique_ratio = unique_count / total_rows
            if unique_ratio > 0.5 and unique_count > 10:
                high_card_cols.append((col, unique_count))
        
        if high_card_cols:
            insights.append({
                "type": "warning",
                "category": "encoding",
                "title": "High Cardinality Detected",
                "description": f"{len(high_card_cols)} categorical columns have very high cardinality.",
                "severity": "medium",
                "details": {
                    "columns": dict(high_card_cols)
                },
                "action": "Consider label encoding, target encoding, or feature hashing instead of one-hot encoding."
            })
        else:
            insights.append({
                "type": "info",
                "category": "encoding",
                "title": "Suitable for One-Hot Encoding",
                "description": "Categorical features have reasonable cardinality for one-hot encoding.",
                "severity": "info"
            })
    
    # 5. Multicollinearity Check (for numeric columns)
    if len(numeric_cols) > 1:
        try:
            corr_matrix = df[numeric_cols].corr()
            # Find pairs with correlation > 0.9
            high_corr_pairs = []
            for i in range(len(corr_matrix.columns)):
                for j in range(i+1, len(corr_matrix.columns)):
                    if abs(corr_matrix.iloc[i, j]) > 0.9:
                        high_corr_pairs.append({
                            "col1": corr_matrix.columns[i],
                            "col2": corr_matrix.columns[j],
                            "correlation": float(corr_matrix.iloc[i, j])
                        })
            
            if high_corr_pairs:
                insights.append({
                    "type": "warning",
                    "category": "correlation",
                    "title": "High Correlation Detected",
                    "description": f"{len(high_corr_pairs)} pairs of features are highly correlated (>0.9).",
                    "severity": "medium",
                    "details": {
                        "pairs": high_corr_pairs[:5]  # Limit to top 5
                    },
                    "action": "Consider removing one feature from each highly correlated pair."
                })
        except Exception:
            pass  # Skip correlation check if it fails
    
    # 6. Outlier Detection (IQR method for numeric columns)
    if len(numeric_cols) > 0:
        outlier_cols = []
        for col in numeric_cols:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            outliers = df[(df[col] < Q1 - 1.5 * IQR) | (df[col] > Q3 + 1.5 * IQR)]
            if len(outliers) > 0:
                outlier_pct = (len(outliers) / total_rows) * 100
                if outlier_pct > 5:
                    outlier_cols.append((col, outlier_pct))
        
        if outlier_cols:
            insights.append({
                "type": "warning",
                "category": "outliers",
                "title": "Outliers Detected",
                "description": f"{len(outlier_cols)} numeric features contain significant outliers.",
                "severity": "medium",
                "details": {
                    "columns": dict(outlier_cols)
                },
                "action": "Consider IQR-based removal, capping, or robust scaling methods."
            })
    
    return {
        "insights": insights,
        "summary": {
            "total_rows": total_rows,
            "total_columns": len(df.columns),
            "numeric_columns": len(numeric_cols),
            "categorical_columns": len(categorical_cols),
            "warnings_count": len([i for i in insights if i["type"] == "warning"])
        }
    }
