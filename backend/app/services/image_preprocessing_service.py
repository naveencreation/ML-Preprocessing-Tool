import pandas as pd
import os
from PIL import Image, ImageOps
import numpy as np
from pathlib import Path

def process_image_data(
    df: pd.DataFrame,
    # Image Options
    image_column: str = None, # Column containing file paths
    image_resize: bool = False,
    image_width: int = 224,
    image_height: int = 224,
    image_grayscale: bool = False,
    image_normalize: bool = False,
    image_augmentation: bool = False,
    # General
    missing_option: str = "Drop Rows",
) -> pd.DataFrame:
    """
    Image preprocessing service.
    Assumes the dataset contains a column with FILE PATHS to images.
    It processes the images in-place (or saves new ones) and updates the dataframe metadata?
    
    Actually, for a preprocessing tool, usually we want to load images, process them, and maybe save them back 
    or convert them to arrays (embeddings/tensors).
    
    For this MVP, let's assume we process the images and save them to a new 'processed_images' directory,
    and update the dataframe with the new paths. 
    Alternatively, if 'image_normalize' is true, maybe we return a dataframe of pixel values? 
    No, that would be too huge for CSV.
    
    Strategy:
    1. Iterate through image paths.
    2. Load image.
    3. Apply transformations.
    4. Save processed image to a new folder.
    5. Update DataFrame with new paths.
    6. If 'image_normalize' is checked, maybe we just note it in metadata, 
       or we could potentially extract features (embeddings) if we had a model.
       For now, let's stick to file-to-file transformation.
    """
    df = df.copy()
    
    # Identify image path column
    # We look for a column that looks like a file path or explicitly provided
    if not image_column:
        # Heuristic: First column containing strings that end with image extensions
        for col in df.select_dtypes(include=['object']).columns:
            sample = df[col].dropna().astype(str).iloc[0] if not df[col].dropna().empty else ""
            if sample.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp')):
                image_column = col
                break
    
    if not image_column or image_column not in df.columns:
        return df

    # Create output directory for processed images
    # We need to know where the original images are relative to. 
    # Assuming paths in DF are absolute or relative to the dataset file.
    # Ideally, the user uploaded a zip, but here we might just have a CSV with paths?
    # Or maybe the "Dataset" IS the image file? 
    # Wait, the current upload logic for 'image' type sets dataset_type='image' if the uploaded file IS an image.
    # But `process_image_data` takes a DataFrame.
    
    # Scenario A: The dataset is a CSV containing paths to images.
    # Scenario B: The dataset is a single image file.
    # The `preprocessing.py` logic loads `pd.read_csv(dataset.filepath)`. 
    # If the user uploaded a single image, `pd.read_csv` will fail.
    
    # Correction: The `upload_dataset` logic for images currently just saves the image.
    # `preprocessing.py` tries `pd.read_csv`. This will crash for single images.
    # I need to fix `preprocessing.py` to handle non-CSV datasets first.
    
    # However, if the user uploaded a CSV *referencing* images, that's different.
    # Let's assume for this "Image Data Support" phase, we are handling:
    # 1. A CSV that contains paths to images (common in ML).
    # 2. OR we need to handle the single-image case in the router.
    
    # Let's implement the service to handle a DataFrame of paths for now.
    # If the input is a single image, the router should probably wrap it in a 1-row DataFrame or handle it separately.
    
    # Let's assume we are processing a DataFrame of paths.
    
    processed_paths = []
    
    # We need a base path. Since we don't have it here, we assume paths are absolute or we can't find them.
    # But wait, if the user uploaded a CSV, where are the images? 
    # They aren't on the server unless uploaded separately.
    
    # REALITY CHECK: 
    # In a web tool, unless the user uploads a ZIP of images, we can't process "paths" in a CSV.
    # OR, the user uploads ONE image and we process it.
    # If the user uploads ONE image, `dataset.dataset_type` is 'image'.
    # `preprocessing.py` needs to NOT `read_csv` it.
    
    # Let's adjust the Router later to handle single image loading.
    # For this service, let's assume the input is a list of PIL Images or paths that EXIST.
    
    # Since I can't easily fix the "upload zip" flow right now without big changes,
    # I will support the "Single Image Upload" flow.
    # The Router will pass a DataFrame with 1 row: {'filepath': 'path/to/image'}.
    
    def process_single_image(row):
        path = row.get(image_column)
        if not path or not os.path.exists(path):
            return None
            
        try:
            with Image.open(path) as img:
                # Convert to RGB if needed
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # 1. Grayscale
                if image_grayscale:
                    img = ImageOps.grayscale(img)
                
                # 2. Resize
                if image_resize:
                    img = img.resize((image_width, image_height))
                
                # 3. Augmentation (Simple Flip)
                if image_augmentation:
                    img = ImageOps.mirror(img)
                
                # 4. Normalize (Pixel scaling)
                # We can't save "normalized" (float) images easily as PNG/JPG. 
                # Usually normalization happens at load time for training.
                # But we can save the transformations that persist (resize, gray, augment).
                
                # Save processed image
                # Create a new filename
                p = Path(path)
                new_filename = f"{p.stem}_processed{p.suffix}"
                new_path = p.parent / new_filename
                
                img.save(new_path)
                return str(new_path)
                
        except Exception as e:
            print(f"Error processing image {path}: {e}")
            return None

    df['processed_filepath'] = df.apply(process_single_image, axis=1)
    
    # If we want to return metadata about the image
    if image_normalize:
        # Just add a column saying it should be normalized
        df['normalization_required'] = True
        
    return df
