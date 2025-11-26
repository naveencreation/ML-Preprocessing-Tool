import pandas as pd
import os
import numpy as np
from pathlib import Path
import warnings

# Try importing librosa, handle if missing
try:
    import librosa
    import soundfile as sf
    LIBROSA_AVAILABLE = True
except ImportError:
    LIBROSA_AVAILABLE = False

def process_audio_data(
    df: pd.DataFrame,
    # Audio Options
    audio_column: str = None, # Column containing file paths
    audio_resample: bool = False,
    audio_sample_rate: int = 16000,
    audio_trim_silence: bool = False,
    audio_duration: float = 0.0,
    audio_feature_extraction: str = "None", # "MFCC", "Spectrogram", "Chroma"
    # General
    missing_option: str = "Drop Rows",
) -> pd.DataFrame:
    """
    Audio preprocessing service.
    Supports:
    1. Audio Cleaning/Transformation (Resample, Trim, Cut) -> Saves new files.
    2. Feature Extraction (MFCC, etc.) -> Returns DataFrame with features (for ML).
    """
    if not LIBROSA_AVAILABLE:
        raise ImportError("librosa and soundfile are required for audio processing. Please install them.")

    df = df.copy()
    
    # Identify audio path column
    if not audio_column:
        for col in df.select_dtypes(include=['object']).columns:
            sample = df[col].dropna().astype(str).iloc[0] if not df[col].dropna().empty else ""
            if sample.lower().endswith(('.wav', '.mp3', '.flac', '.ogg')):
                audio_column = col
                break
    
    if not audio_column or audio_column not in df.columns:
        return df

    # If Feature Extraction is requested, we return a NEW DataFrame with features
    if audio_feature_extraction != "None":
        return extract_audio_features(
            df, 
            audio_column, 
            audio_feature_extraction, 
            audio_sample_rate if audio_resample else None
        )

    # Otherwise, we process files in-place (save new files)
    def process_single_audio(row):
        path = row.get(audio_column)
        if not path or not os.path.exists(path):
            return None
            
        try:
            # Load audio
            # librosa.load resamples to 22050 by default unless sr=None
            target_sr = audio_sample_rate if audio_resample else None
            y, sr = librosa.load(path, sr=target_sr)
            
            # 1. Trim Silence
            if audio_trim_silence:
                y, _ = librosa.effects.trim(y)
            
            # 2. Trim Duration (Fixed length)
            if audio_duration > 0:
                max_samples = int(audio_duration * sr)
                if len(y) > max_samples:
                    y = y[:max_samples]
                else:
                    # Pad if needed? Or just leave it. Let's leave it.
                    pass
            
            # Save processed audio
            p = Path(path)
            new_filename = f"{p.stem}_processed.wav" # Always save as wav for compatibility
            new_path = p.parent / new_filename
            
            sf.write(new_path, y, sr)
            return str(new_path)
                
        except Exception as e:
            print(f"Error processing audio {path}: {e}")
            return None

    df['processed_filepath'] = df.apply(process_single_audio, axis=1)
    return df

def extract_audio_features(df, audio_column, method, sr_override=None):
    """
    Extracts features from audio files and returns a DataFrame of features.
    """
    features_list = []
    
    for index, row in df.iterrows():
        path = row.get(audio_column)
        if not path or not os.path.exists(path):
            features_list.append({})
            continue
            
        try:
            y, sr = librosa.load(path, sr=sr_override)
            
            features = {}
            if method == "MFCC":
                # Extract MFCCs (mean across time)
                mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
                mfccs_mean = np.mean(mfccs, axis=1)
                for i, val in enumerate(mfccs_mean):
                    features[f'mfcc_{i+1}'] = val
                    
            elif method == "Chroma":
                chroma = librosa.feature.chroma_stft(y=y, sr=sr)
                chroma_mean = np.mean(chroma, axis=1)
                for i, val in enumerate(chroma_mean):
                    features[f'chroma_{i+1}'] = val
                    
            elif method == "Spectrogram":
                # Spectral Centroid, Bandwidth, Contrast
                cent = librosa.feature.spectral_centroid(y=y, sr=sr)
                features['spectral_centroid'] = np.mean(cent)
                bw = librosa.feature.spectral_bandwidth(y=y, sr=sr)
                features['spectral_bandwidth'] = np.mean(bw)
                
            features_list.append(features)
            
        except Exception as e:
            print(f"Error extracting features from {path}: {e}")
            features_list.append({})
            
    # Create DataFrame from features
    features_df = pd.DataFrame(features_list)
    # Merge with original? Usually we want to replace the audio column with features
    # But let's keep other metadata
    result_df = pd.concat([df.drop(columns=[audio_column]), features_df], axis=1)
    return result_df
