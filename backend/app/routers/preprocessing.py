from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import os
import joblib
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
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    
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
            df = pd.DataFrame({'filepath': [dataset.filepath]})
        elif dataset.dataset_type in ["text", "logs"]:
            with open(dataset.filepath, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            df = pd.DataFrame({'content': [line.strip() for line in lines]})
        else:
            df = pd.read_csv(dataset.filepath)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")
    
    if df.empty:
        raise HTTPException(status_code=400, detail="Dataset is empty")
        
    # --- PRE-PROCESSING (Modality Specific) ---
    # If it's Audio/Image, we might extract features and turn it into Tabular data.
    try:
        if dataset.dataset_type == "audio":
            # Process Audio (Resample, Trim, Feature Extraction)
            # If feature extraction is used, df becomes a DataFrame of features (Tabular)
            df = audio_preprocessing_service.process_audio_data(
                df,
                audio_column=options.audio_column,
                audio_resample=options.audio_resample,
                audio_sample_rate=options.audio_sample_rate,
                audio_trim_silence=options.audio_trim_silence,
                audio_duration=options.audio_duration,
                audio_feature_extraction=options.audio_feature_extraction
            )
            # If we extracted features, we now have a tabular dataset!
            if options.audio_feature_extraction != "None":
                dataset.dataset_type = "tabular" # Treat as tabular for the rest of the flow
                
        elif dataset.dataset_type == "image":
            # Process Image (Resize, Grayscale, etc.)
            df = image_preprocessing_service.process_image_data(
                df,
                image_column=options.image_column,
                image_resize=options.image_resize,
                image_width=options.image_width,
                image_height=options.image_height,
                image_grayscale=options.image_grayscale,
                image_normalize=options.image_normalize,
                image_augmentation=options.image_augmentation
            )
            # Currently image service doesn't extract features to DF (except paths), 
            # so it remains "image" type unless we add feature extraction.
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Image/Audio preprocessing error: {str(e)}")
        
    # --- TEXT PIPELINE ---
    if dataset.dataset_type == "text":
        try:
            # ... (Existing Text Logic) ...
            # 1. Clean (Basic)
            df_clean = text_preprocessing_service.clean_text_data(df, text_column=options.text_column)
            text_col = options.text_column if options.text_column else df_clean.columns[0]
            
            # 2. SPLIT
            if options.train_test_split:
                from sklearn.model_selection import train_test_split
                train_df, test_df = train_test_split(df_clean, test_size=options.test_size, random_state=42)
                
                # 3. BUILD & FIT PIPELINE (Train Only)
                pipeline = text_preprocessing_service.build_text_pipeline(
                    text_cleaning_method=options.text_cleaning_method,
                    stopword_removal=options.stopword_removal,
                    stemming=options.stemming,
                    lemmatization=options.lemmatization,
                    vectorization_method=options.vectorization_method
                )
                
                # Fit on Train (Text column only)
                pipeline.fit(train_df[text_col])
                
                # 4. TRANSFORM
                # Text pipeline returns a sparse matrix or array. We need to convert to DataFrame.
                train_vectors = pipeline.transform(train_df[text_col])
                test_vectors = pipeline.transform(test_df[text_col])
                
                # Convert to DataFrame
                if options.vectorization_method != "None":
                    # Get feature names if possible
                    try:
                        feature_names = pipeline.named_steps['vectorizer'].get_feature_names_out()
                        train_processed = pd.DataFrame(train_vectors.toarray(), columns=feature_names, index=train_df.index)
                        test_processed = pd.DataFrame(test_vectors.toarray(), columns=feature_names, index=test_df.index)
                    except:
                        # Fallback if no vectorizer or error
                        train_processed = pd.DataFrame(train_vectors, index=train_df.index)
                        test_processed = pd.DataFrame(test_vectors, index=test_df.index)
                else:
                    # If no vectorization, we just have the cleaned text (if cleaner was last step)
                    # But pipeline returns the output of last step. TextCleaner returns Series.
                    train_processed = pd.DataFrame(train_vectors, columns=[text_col], index=train_df.index)
                    test_processed = pd.DataFrame(test_vectors, columns=[text_col], index=test_df.index)

                # Save Train
                train_filename = f"processed_train_{timestamp}_{dataset.filename.replace('.txt', '.csv')}"
                train_filepath = settings.PROCESSED_DIR / train_filename
                train_processed.to_csv(train_filepath, index=False)
                
                # Save Test
                test_filename = f"processed_test_{timestamp}_{dataset.filename.replace('.txt', '.csv')}"
                test_filepath = settings.PROCESSED_DIR / test_filename
                test_processed.to_csv(test_filepath, index=False)
                
                # Save Artifact
                artifact_filename = f"pipeline_text_{timestamp}_{dataset_id}.pkl"
                artifact_filepath = settings.ARTIFACTS_DIR / artifact_filename
                joblib.dump(pipeline, artifact_filepath)
                
                # Create Dataset Entries (Train)
                train_dataset = models.Dataset(
                    filename=train_filename,
                    filepath=str(train_filepath),
                    size_bytes=os.path.getsize(train_filepath),
                    row_count=len(train_processed),
                    column_count=len(train_processed.columns),
                    status="Processed (Train)",
                    parent_dataset_id=dataset_id,
                    dataset_type="tabular" # Converted to tabular
                )
                db.add(train_dataset)
                
                # Create Dataset Entries (Test)
                test_dataset = models.Dataset(
                    filename=test_filename,
                    filepath=str(test_filepath),
                    size_bytes=os.path.getsize(test_filepath),
                    row_count=len(test_processed),
                    column_count=len(test_processed.columns),
                    status="Processed (Test)",
                    parent_dataset_id=dataset_id,
                    dataset_type="tabular"
                )
                db.add(test_dataset)
                
                db.commit()
                db.refresh(train_dataset)
                
                # Log
                log_params = options.dict()
                log_params["artifact_path"] = str(artifact_filepath)
                log = models.ProcessingLog(
                    dataset_id=train_dataset.id,
                    action="preprocessing_text_split",
                    parameters=log_params
                )
                db.add(log)
                db.commit()
                
                return train_dataset
                
            else:
                # No Split
                pipeline = text_preprocessing_service.build_text_pipeline(
                    text_cleaning_method=options.text_cleaning_method,
                    stopword_removal=options.stopword_removal,
                    stemming=options.stemming,
                    lemmatization=options.lemmatization,
                    vectorization_method=options.vectorization_method
                )
                
                pipeline.fit(df_clean[text_col])
                vectors = pipeline.transform(df_clean[text_col])
                
                if options.vectorization_method != "None":
                    feature_names = pipeline.named_steps['vectorizer'].get_feature_names_out()
                    processed_df = pd.DataFrame(vectors.toarray(), columns=feature_names, index=df_clean.index)
                else:
                    processed_df = pd.DataFrame(vectors, columns=[text_col], index=df_clean.index)
                    
                # Save
                new_filename = f"processed_{timestamp}_{dataset.filename.replace('.txt', '.csv')}"
                new_filepath = settings.PROCESSED_DIR / new_filename
                processed_df.to_csv(new_filepath, index=False)
                
                new_dataset = models.Dataset(
                    filename=new_filename,
                    filepath=str(new_filepath),
                    size_bytes=os.path.getsize(new_filepath),
                    row_count=len(processed_df),
                    column_count=len(processed_df.columns),
                    status="Processed",
                    parent_dataset_id=dataset_id,
                    dataset_type="tabular"
                )
                db.add(new_dataset)
                db.commit()
                db.refresh(new_dataset)
                
                return new_dataset
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Text preprocessing error: {str(e)}")

    # --- TABULAR PIPELINE (Corrected) ---
    # If dataset was converted to tabular (e.g. Audio Features), we proceed here.
    if dataset.dataset_type == "tabular" or dataset.dataset_type is None:
        import time
        timestamp = int(time.time())
        
        try:
            # 1. CLEANING (Row Removal) - Applied to ALL data first? 
            # Ideally, we split first, then clean. But if we drop rows in Test, it might be confusing.
            # Standard practice: Clean duplicates/formats on everything (if it's data quality issues).
            # Outlier removal: ONLY on Train.
            
            # Let's do basic cleaning on everything
            df_clean = tabular_preprocessing_service.clean_data(
                df, 
                remove_duplicates=options.remove_duplicates,
                outlier_method="None", # Don't remove outliers yet
                columns=options.columns
            )
            
            # 2. SPLIT
            if options.train_test_split:
                from sklearn.model_selection import train_test_split
                
                train_df, test_df = train_test_split(
                    df_clean, 
                    test_size=options.test_size, 
                    stratify=df_clean[options.target_column] if options.stratify and options.target_column and options.target_column in df_clean.columns else None,
                    random_state=42
                )
                
                # 3. OUTLIER REMOVAL (Train Only)
                train_df = tabular_preprocessing_service.clean_data(
                    train_df,
                    remove_duplicates=False, # Already done
                    outlier_method=options.outlier_method,
                    columns=options.columns
                )
                
                # 4. BUILD & FIT PIPELINE (Train Only)
                pipeline = tabular_preprocessing_service.build_pipeline(
                    train_df,
                    missing_option=options.missing_option,
                    encoding_method=options.encoding_method,
                    scaling_method=options.scaling_method,
                    date_feature_extraction=options.date_feature_extraction,
                    text_feature_extraction=options.text_feature_extraction,
                    rare_category_handling=options.rare_category_handling,
                    remove_high_correlation=options.remove_high_correlation,
                    low_variance_filtering=options.low_variance_filtering,
                    fix_numeric_formats=options.fix_numeric_formats,
                    standardize_text=options.standardize_text,
                    columns=options.columns
                )
                
                # Fit on Train
                # We need to handle the ColumnTransformer output which is a numpy array usually.
                # We want to keep it as DataFrame if possible or convert back.
                # Sklearn 1.2+ supports set_output(transform='pandas')
                
                pipeline.set_output(transform="pandas")
                
                # Fit
                pipeline.fit(train_df)
                
                # 5. TRANSFORM (Train & Test)
                train_processed = pipeline.transform(train_df)
                test_processed = pipeline.transform(test_df)
                
                # Save Train
                train_filename = f"processed_train_{timestamp}_{dataset.filename}"
                train_filepath = settings.PROCESSED_DIR / train_filename
                train_processed.to_csv(train_filepath, index=False)
                
                # Save Test
                test_filename = f"processed_test_{timestamp}_{dataset.filename}"
                test_filepath = settings.PROCESSED_DIR / test_filename
                test_processed.to_csv(test_filepath, index=False)
                
                # Save Pipeline Artifact
                artifact_filename = f"pipeline_{timestamp}_{dataset_id}.pkl"
                artifact_filepath = settings.ARTIFACTS_DIR / artifact_filename
                joblib.dump(pipeline, artifact_filepath)
                
                # Store artifact path in metadata (for now, we'll add it to the log)
                artifact_info = {"pipeline_path": str(artifact_filepath)}
                
                # Create Dataset Entries
                train_dataset = models.Dataset(
                    filename=train_filename,
                    filepath=str(train_filepath),
                    size_bytes=os.path.getsize(train_filepath),
                    row_count=len(train_processed),
                    column_count=len(train_processed.columns),
                    status="Processed (Train)",
                    parent_dataset_id=dataset_id
                )
                db.add(train_dataset)
                
                test_dataset = models.Dataset(
                    filename=test_filename,
                    filepath=str(test_filepath),
                    size_bytes=os.path.getsize(test_filepath),
                    row_count=len(test_processed),
                    column_count=len(test_processed.columns),
                    status="Processed (Test)",
                    parent_dataset_id=dataset_id
                )
                db.add(test_dataset)
                
                db.commit()
                db.refresh(train_dataset)
                
                # Log action with artifact info
                log_params = options.dict()
                log_params["artifact_path"] = str(artifact_filepath)
                log = models.ProcessingLog(
                    dataset_id=train_dataset.id,
                    action="preprocessing_split_v2",
                    parameters=log_params
                )
                db.add(log)
                db.commit()
                
                return train_dataset
    
            else:
                # No Split - Just Process All (Not recommended for ML, but okay for cleaning)
                # 1. Clean
                 df_clean = tabular_preprocessing_service.clean_data(
                    df, 
                    remove_duplicates=options.remove_duplicates,
                    outlier_method=options.outlier_method, # Applied to all if no split
                    columns=options.columns
                )
                 
                 # 2. Pipeline
                 pipeline = tabular_preprocessing_service.build_pipeline(
                    df_clean,
                    missing_option=options.missing_option,
                    encoding_method=options.encoding_method,
                    scaling_method=options.scaling_method,
                    date_feature_extraction=options.date_feature_extraction,
                    text_feature_extraction=options.text_feature_extraction,
                    rare_category_handling=options.rare_category_handling,
                    remove_high_correlation=options.remove_high_correlation,
                    low_variance_filtering=options.low_variance_filtering,
                    fix_numeric_formats=options.fix_numeric_formats,
                    standardize_text=options.standardize_text,
                    columns=options.columns
                )
                 
                 pipeline.set_output(transform="pandas")
                 processed_df = pipeline.fit_transform(df_clean)
                 
                 # Save
                 new_filename = f"processed_{timestamp}_{dataset.filename}"
                 new_filepath = settings.PROCESSED_DIR / new_filename
                 processed_df.to_csv(new_filepath, index=False)
                 
                 new_dataset = models.Dataset(
                    filename=new_filename,
                    filepath=str(new_filepath),
                    size_bytes=os.path.getsize(new_filepath),
                    row_count=len(processed_df),
                    column_count=len(processed_df.columns),
                    status="Processed",
                    parent_dataset_id=dataset_id
                )
                 db.add(new_dataset)
                 db.commit()
                 db.refresh(new_dataset)
                 
                 log = models.ProcessingLog(
                    dataset_id=new_dataset.id,
                    action="preprocessing_v2",
                    parameters=options.dict()
                )
                 db.add(log)
                 db.commit()
                 
                 return new_dataset
    
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Preprocessing error: {str(e)}")


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
