from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import os
from app.database import get_db
from app import models, schemas
from app.services import code_generator, notebook_generator, tabular_preprocessing_service, text_preprocessing_service, image_preprocessing_service, audio_preprocessing_service, timeseries_preprocessing_service, log_preprocessing_service
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
        if dataset.dataset_type in ["image", "audio"]:
            # For images and audio, we create a pseudo-dataframe with the filepath
            df = pd.DataFrame({'filepath': [dataset.filepath]})
        elif dataset.dataset_type in ["text", "logs"]:
            # Read text/log file into a DataFrame with one column 'content'
            with open(dataset.filepath, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            df = pd.DataFrame({'content': [line.strip() for line in lines]})
        else:
            # Tabular or default
            df = pd.read_csv(dataset.filepath)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")
    
    # Validate non-empty dataframe
    if df.empty:
        raise HTTPException(status_code=400, detail="Dataset is empty")
        
    # Apply processing
    try:
        # Route based on dataset type
        if dataset.dataset_type == "text":
            processed_df = text_preprocessing_service.process_text_data(
                df,
                text_column=options.columns[0] if options.columns else None,
                text_cleaning_method=options.text_cleaning_method,
                stopword_removal=options.stopword_removal,
                stemming=options.stemming,
                lemmatization=options.lemmatization,
                tokenization=options.tokenization,
                vectorization_method=options.vectorization_method,
                missing_option=options.missing_option
            )
        elif dataset.dataset_type == "image":
            # Image service (saves files, returns df with paths)
            processed_df = image_preprocessing_service.process_image_data(
                df,
                image_column='filepath',
                image_resize=options.image_resize,
                image_width=options.image_width,
                image_height=options.image_height,
                image_grayscale=options.image_grayscale,
                image_normalize=options.image_normalize,
                image_augmentation=options.image_augmentation,
                missing_option=options.missing_option
            )
        elif dataset.dataset_type == "audio":
            processed_df = audio_preprocessing_service.process_audio_data(
                df,
                audio_column='filepath',
                audio_resample=options.audio_resample,
                audio_sample_rate=options.audio_sample_rate,
                audio_trim_silence=options.audio_trim_silence,
                audio_duration=options.audio_duration,
                audio_feature_extraction=options.audio_feature_extraction,
                missing_option=options.missing_option
            )
        elif dataset.dataset_type == "timeseries" or (dataset.dataset_type == "tabular" and (options.ts_resample or options.ts_rolling_window or options.ts_lag_features or options.ts_decompose)):
            processed_df = timeseries_preprocessing_service.process_timeseries_data(
                df,
                date_column=options.columns[0] if options.columns else None,
                ts_resample=options.ts_resample,
                ts_resample_freq=options.ts_resample_freq,
                ts_handle_missing=options.ts_handle_missing,
                ts_rolling_window=options.ts_rolling_window,
                ts_window_size=options.ts_window_size,
                ts_lag_features=options.ts_lag_features,
                ts_lags=options.ts_lags,
                ts_decompose=options.ts_decompose,
                columns=options.columns
            )
        elif dataset.dataset_type == "logs":
            processed_df = log_preprocessing_service.process_log_data(
                df,
                log_parse_timestamp=options.log_parse_timestamp,
                log_extract_levels=options.log_extract_levels,
                log_pattern_extraction=options.log_pattern_extraction,
                columns=options.columns
            )
        else:
            # Default to tabular
            processed_df = tabular_preprocessing_service.process_tabular_data(
                df, 
                options.missing_option, 
                options.encoding_method, 
                options.scaling_method,
                options.outlier_method,
                options.columns
            )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preprocessing error: {str(e)}")
    
    # Save processed data
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
        # Load parent dataset based on type
        if parent.dataset_type in ["text", "logs"]:
            with open(parent.filepath, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            original_df = pd.DataFrame({'content': [line.strip() for line in lines]})
        elif parent.dataset_type in ["image", "audio"]:
             original_df = pd.DataFrame({'filepath': [parent.filepath]})
        else:
            original_df = pd.read_csv(parent.filepath)

        # Processed dataset is always saved as CSV
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

@router.get("/{dataset_id}/logs")
def get_dataset_logs(dataset_id: int, db: Session = Depends(get_db)):
    """
    Get processing logs for a specific dataset.
    """
    logs = db.query(models.ProcessingLog).filter(models.ProcessingLog.dataset_id == dataset_id).order_by(models.ProcessingLog.created_at.desc()).all()
    return logs




@router.get("/logs/all")
def get_all_logs(limit: int = 100, db: Session = Depends(get_db)):
    """Get all processing logs across all datasets"""
    logs = db.query(models.ProcessingLog).order_by(
        models.ProcessingLog.created_at.desc()
    ).limit(limit).all()
    
    return logs

@router.post("/{dataset_id}/export-notebook")
def export_notebook(
    dataset_id: int,
    options: schemas.PreprocessingOptions,
    db: Session = Depends(get_db)
):
    """Export the preprocessing configuration as a Jupyter notebook."""
    from fastapi.responses import Response
    import json
    
    # Fetch dataset
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        # Generate notebook
        notebook_dict = notebook_generator.generate_notebook(
            dataset.filename,
            options.dict()
        )
        
        # Convert to JSON string
        notebook_json = json.dumps(notebook_dict, indent=2)
        
        # Create filename
        notebook_filename = f"{dataset.filename.replace('.csv', '')}_pipeline.ipynb"
        
        # Return as downloadable file
        return Response(
            content=notebook_json,
            media_type="application/x-ipynb+json",
            headers={
                "Content-Disposition": f"attachment; filename={notebook_filename}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating notebook: {str(e)}")
