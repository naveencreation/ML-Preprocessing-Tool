from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import os
from app.database import get_db
from app import models, schemas
from app.services import data_processing, code_generator
from app.config import settings

router = APIRouter(
    prefix="/preprocessing",
    tags=["preprocessing"]
)

@router.post("/{dataset_id}/apply", response_model=schemas.Dataset)
def apply_preprocessing(
    dataset_id: int, 
    options: schemas.PreprocessingOptions, 
    db: Session = Depends(get_db)
):
    # Fetch dataset
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Check if file exists
    if not os.path.exists(dataset.filepath):
        raise HTTPException(status_code=404, detail="Dataset file not found on server")
    
    # Load data
    try:
        df = pd.read_csv(dataset.filepath)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")
    
    # Validate non-empty dataframe
    if df.empty:
        raise HTTPException(status_code=400, detail="Dataset is empty")
        
    # Apply processing
    try:
        processed_df = data_processing.process_dataframe(
            df, 
            options.missing_option, 
            options.encoding_method, 
            options.scaling_method,
            options.outlier_method,
            options.feature_engineering_method,
            options.columns,
            # New Options
            options.remove_duplicates,
            options.fix_numeric_formats,
            options.fix_date_formats,
            options.standardize_text,
            options.target_encoding,
            options.frequency_encoding,
            options.date_feature_extraction,
            options.text_feature_extraction,
            options.rare_category_handling,
            options.target_column,
            options.smote_oversampling,
            options.remove_high_correlation,
            options.low_variance_filtering
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Processing failed: {str(e)}")
    
    # Validate processing didn't result in empty dataframe
    if processed_df.empty:
        raise HTTPException(status_code=400, detail="Processing resulted in empty dataset. Try different options.")
        
    # Save processed file(s)
    import time
    timestamp = int(time.time())
    
    if options.train_test_split:
        from sklearn.model_selection import train_test_split
        
        # Split
        train_df, test_df = train_test_split(
            processed_df, 
            test_size=options.test_size, 
            stratify=processed_df[options.target_column] if options.stratify and options.target_column and options.target_column in processed_df.columns else None,
            random_state=42
        )
        
        # Save Train
        train_filename = f"processed_train_{timestamp}_{dataset.filename}"
        train_filepath = settings.PROCESSED_DIR / train_filename
        train_df.to_csv(train_filepath, index=False)
        
        # Save Test
        test_filename = f"processed_test_{timestamp}_{dataset.filename}"
        test_filepath = settings.PROCESSED_DIR / test_filename
        test_df.to_csv(test_filepath, index=False)
        
        # Create Dataset Entry for Train
        train_dataset = models.Dataset(
            filename=train_filename,
            filepath=str(train_filepath),
            size_bytes=os.path.getsize(train_filepath),
            row_count=len(train_df),
            column_count=len(train_df.columns),
            status="Processed (Train)",
            parent_dataset_id=dataset_id
        )
        db.add(train_dataset)
        
        # Create Dataset Entry for Test
        test_dataset = models.Dataset(
            filename=test_filename,
            filepath=str(test_filepath),
            size_bytes=os.path.getsize(test_filepath),
            row_count=len(test_df),
            column_count=len(test_df.columns),
            status="Processed (Test)",
            parent_dataset_id=dataset_id
        )
        db.add(test_dataset)
        
        db.commit()
        db.refresh(train_dataset)
        
        # Log action
        log = models.ProcessingLog(
            dataset_id=train_dataset.id,
            action="preprocessing_split",
            parameters=options.dict()
        )
        db.add(log)
        db.commit()
        
        return train_dataset

    else:
        # Standard Save
        new_filename = f"processed_{timestamp}_{dataset.filename}"
        new_filepath = settings.PROCESSED_DIR / new_filename
        
        try:
            processed_df.to_csv(new_filepath, index=False)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error saving processed file: {str(e)}")
        
        # Create new dataset entry
        size_bytes = os.path.getsize(new_filepath)
        row_count, column_count = processed_df.shape
        
        new_dataset = models.Dataset(
            filename=new_filename,
            filepath=str(new_filepath),
            size_bytes=size_bytes,
            row_count=row_count,
            column_count=column_count,
            status="Processed",
            parent_dataset_id=dataset_id  # Link to parent dataset
        )
        
        db.add(new_dataset)
        db.commit()
        db.refresh(new_dataset)
        
        # Log the action (link to NEW dataset)
        log = models.ProcessingLog(
            dataset_id=new_dataset.id,  # Reference the new processed dataset
            action="preprocessing",
            parameters=options.dict()
        )
        db.add(log)
        db.commit()
        
        return new_dataset


@router.post("/{dataset_id}/generate-code")
def generate_code(
    dataset_id: int,
    options: schemas.PreprocessingOptions,
    format: str = "simple",  # "simple" or "pipeline"
    db: Session = Depends(get_db)
):
    """
    Generate Python code equivalent for the preprocessing operations.
    Helps users learn and reproduce preprocessing outside the tool.
    """
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    if format == "pipeline":
        code = code_generator.generate_pipeline_code(
            dataset.filename,
            options.missing_option,
            options.encoding_method,
            options.scaling_method,
            options.columns
        )
    else:
        code = code_generator.generate_preprocessing_code(
            dataset.filename,
            options.missing_option,
            options.encoding_method,
            options.scaling_method,
            options.columns
        )
    
    return {
        "code": code,
        "format": format,
        "filename": f"preprocessing_{format}.py"
    }


@router.get("/{dataset_id}/comparison")
def get_comparison(dataset_id: int, db: Session = Depends(get_db)):
    """
    Get comparison data between a processed dataset and its parent.
    Shows what changed during preprocessing.
    """
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    if dataset.parent_dataset_id is None:
        raise HTTPException(status_code=400, detail="This dataset has no parent to compare with")
    
    parent = db.query(models.Dataset).filter(models.Dataset.id == dataset.parent_dataset_id).first()
    if parent is None:
        raise HTTPException(status_code=404, detail="Parent dataset not found")
    
    try:
        # Load both datasets
        original_df = pd.read_csv(parent.filepath)
        processed_df = pd.read_csv(dataset.filepath)
        
        # Calculate differences
        comparison = {
            "original": {
                "rows": len(original_df),
                "columns": len(original_df.columns),
                "column_names": original_df.columns.tolist(),
                "missing_values": original_df.isnull().sum().to_dict(),
                "dtypes": original_df.dtypes.astype(str).to_dict()
            },
            "processed": {
                "rows": len(processed_df),
                "columns": len(processed_df.columns),
                "column_names": processed_df.columns.tolist(),
                "missing_values": processed_df.isnull().sum().to_dict(),
                "dtypes": processed_df.dtypes.astype(str).to_dict()
            },
            "changes": {
                "rows_removed": len(original_df) - len(processed_df),
                "columns_added": len(processed_df.columns) - len(original_df.columns),
                "columns_removed": list(set(original_df.columns) - set(processed_df.columns)),
                "columns_added_names": list(set(processed_df.columns) - set(original_df.columns))
            }
        }
        
        return comparison
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing datasets: {str(e)}")
