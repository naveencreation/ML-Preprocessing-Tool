import pandas as pd
from pathlib import Path

def load_file(filepath: str, file_type: str = None):
    """
    Unified file loader for various file types.
    """
    path = Path(filepath)
    ext = path.suffix.lower()
    
    if ext == '.csv':
        return pd.read_csv(filepath)
    elif ext in ['.xlsx', '.xls']:
        return pd.read_excel(filepath)
    elif ext == '.json':
        return pd.read_json(filepath)
    elif ext == '.txt':
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    # Add more loaders as needed
    return None
