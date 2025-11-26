import pandas as pd
import numpy as np

def process_timeseries_data(
    df: pd.DataFrame,
    # Time-Series Options
    date_column: str = None,
    ts_resample: bool = False,
    ts_resample_freq: str = "D",
    ts_handle_missing: str = "Forward Fill",
    ts_rolling_window: bool = False,
    ts_window_size: int = 3,
    ts_lag_features: bool = False,
    ts_lags: int = 1,
    ts_decompose: bool = False,
    # General
    columns: list[str] = None
) -> pd.DataFrame:
    """
    Time-Series preprocessing service.
    """
    df = df.copy()
    
    # 1. Identify Date Column
    if not date_column:
        # Heuristic: Look for datetime columns
        for col in df.columns:
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                date_column = col
                break
        # If not found, try converting object columns
        if not date_column:
            for col in df.select_dtypes(include=['object']).columns:
                try:
                    pd.to_datetime(df[col], errors='raise')
                    date_column = col
                    break
                except:
                    pass
    
    if not date_column:
        # Can't do time series without a date column
        return df
        
    # Convert to datetime and set index
    df[date_column] = pd.to_datetime(df[date_column])
    df = df.set_index(date_column).sort_index()
    
    # Filter columns if specified (keep others but only process selected)
    target_cols = columns if columns else df.select_dtypes(include=[np.number]).columns.tolist()
    
    # 2. Resampling
    if ts_resample:
        # Resample and aggregate (default mean for numeric)
        # We need to handle non-numeric columns? Usually drop or first.
        # Let's just resample numeric for now.
        df_resampled = df[target_cols].resample(ts_resample_freq).mean()
        
        # Handle missing values introduced by resampling
        if ts_handle_missing == "Forward Fill":
            df_resampled = df_resampled.ffill()
        elif ts_handle_missing == "Backward Fill":
            df_resampled = df_resampled.bfill()
        elif ts_handle_missing == "Interpolate":
            df_resampled = df_resampled.interpolate(method='time')
            
        df = df_resampled
        
    # 3. Rolling Window Features
    if ts_rolling_window:
        for col in target_cols:
            if col in df.columns:
                df[f'{col}_rolling_mean_{ts_window_size}'] = df[col].rolling(window=ts_window_size).mean()
                df[f'{col}_rolling_std_{ts_window_size}'] = df[col].rolling(window=ts_window_size).std()
                
    # 4. Lag Features
    if ts_lag_features:
        for col in target_cols:
            if col in df.columns:
                for lag in range(1, ts_lags + 1):
                    df[f'{col}_lag_{lag}'] = df[col].shift(lag)
                    
    # 5. Decomposition (Trend, Seasonality)
    if ts_decompose:
        from statsmodels.tsa.seasonal import seasonal_decompose
        # This is heavy and requires no missing values.
        df = df.dropna() # Ensure no missing before decompose
        for col in target_cols:
            if col in df.columns:
                try:
                    # Period depends on freq, let's infer or guess
                    res = seasonal_decompose(df[col], model='additive', period=ts_window_size) # Use window size as period proxy?
                    df[f'{col}_trend'] = res.trend
                    df[f'{col}_seasonal'] = res.seasonal
                    df[f'{col}_residual'] = res.resid
                except Exception as e:
                    print(f"Decomposition failed for {col}: {e}")

    # Reset index to make date a column again
    df = df.reset_index()
    return df
