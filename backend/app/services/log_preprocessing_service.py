import pandas as pd
import re

def process_log_data(
    df: pd.DataFrame,
    # Log Options
    log_parse_timestamp: bool = False,
    log_extract_levels: bool = False,
    log_pattern_extraction: str = "",
    # General
    columns: list[str] = None
) -> pd.DataFrame:
    """
    Log preprocessing service.
    Assumes the log data is loaded into a DataFrame, likely with one column (e.g., 'raw_log') 
    or basic CSV parsing.
    """
    df = df.copy()
    
    # Identify the log column (usually the first object column or 'message')
    log_col = None
    if columns and columns[0] in df.columns:
        log_col = columns[0]
    else:
        # Heuristic
        for col in df.select_dtypes(include=['object']).columns:
            log_col = col
            break
            
    if not log_col:
        return df
        
    # 1. Parse Timestamp
    if log_parse_timestamp:
        # Try to find a date pattern at the start of the string
        # Common: YYYY-MM-DD HH:MM:SS
        def extract_time(text):
            # Simple regex for ISO-like dates
            match = re.search(r'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}', str(text))
            return match.group(0) if match else None
            
        df['extracted_timestamp'] = df[log_col].apply(extract_time)
        df['extracted_timestamp'] = pd.to_datetime(df['extracted_timestamp'], errors='coerce')
        
    # 2. Extract Log Levels
    if log_extract_levels:
        levels = ['INFO', 'ERROR', 'WARNING', 'DEBUG', 'CRITICAL', 'FATAL']
        def extract_level(text):
            for lvl in levels:
                if lvl in str(text):
                    return lvl
            return "UNKNOWN"
            
        df['log_level'] = df[log_col].apply(extract_level)
        
    # 3. Custom Regex Extraction
    if log_pattern_extraction:
        try:
            # User provides a regex with named groups, e.g., "(?P<ip>\d+\.\d+\.\d+\.\d+)"
            extracted = df[log_col].str.extract(log_pattern_extraction)
            if not extracted.empty:
                df = pd.concat([df, extracted], axis=1)
        except Exception as e:
            print(f"Regex extraction failed: {e}")
            
    return df
