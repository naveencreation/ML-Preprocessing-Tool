import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.utils.validation import check_is_fitted

class NumericCleaner(BaseEstimator, TransformerMixin):
    """
    Cleans numeric columns: removes currency symbols, converts to numeric.
    """
    def __init__(self, columns=None):
        self.columns = columns

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        cols_to_clean = self.columns if self.columns else X.select_dtypes(include=['object']).columns
        
        for col in cols_to_clean:
            if col in X.columns:
                # Remove currency symbols, %, and commas
                X[col] = X[col].astype(str).str.replace(r'[^\d.-]', '', regex=True)
                X[col] = pd.to_numeric(X[col], errors='coerce')
        return X

class TextCleaner(BaseEstimator, TransformerMixin):
    """
    Custom transformer for text cleaning operations.
    """
    def __init__(self, cleaning_method="None", stopword_removal=False, stemming=False, lemmatization=False):
        self.cleaning_method = cleaning_method
        self.stopword_removal = stopword_removal
        self.stemming = stemming
        self.lemmatization = lemmatization
        self.stop_words_ = None
        self.stemmer_ = None
        self.lemmatizer_ = None

    def fit(self, X, y=None):
        if self.stopword_removal:
            try:
                import nltk
                from nltk.corpus import stopwords
                try:
                    self.stop_words_ = set(stopwords.words('english'))
                except LookupError:
                    nltk.download('stopwords')
                    self.stop_words_ = set(stopwords.words('english'))
            except ImportError:
                print("NLTK not installed. Stopword removal disabled.")
        
        if self.stemming:
            try:
                from nltk.stem import PorterStemmer
                self.stemmer_ = PorterStemmer()
            except ImportError:
                pass
                
        if self.lemmatization:
            try:
                import nltk
                from nltk.stem import WordNetLemmatizer
                try:
                    self.lemmatizer_ = WordNetLemmatizer()
                    self.lemmatizer_.lemmatize("test") # Test if data is available
                except LookupError:
                    nltk.download('wordnet')
                    nltk.download('omw-1.4')
                    self.lemmatizer_ = WordNetLemmatizer()
            except ImportError:
                pass
                
        return self

    def transform(self, X):
        # X is expected to be a Series or list of text
        if isinstance(X, pd.DataFrame):
            # If DataFrame, take the first column? Or apply to all?
            # Text pipeline usually operates on a single column.
            # But let's handle Series primarily.
            X = X.iloc[:, 0]
            
        X_clean = X.astype(str).copy()
        
        # 1. Basic Cleaning
        if self.cleaning_method == "Lower + Remove Punctuation":
            X_clean = X_clean.str.lower().str.replace(r'[^\w\s]', '', regex=True)
        elif self.cleaning_method == "Lower":
            X_clean = X_clean.str.lower()
            
        # 2. Tokenization & Advanced Processing
        if self.stopword_removal or self.stemming or self.lemmatization:
            X_clean = X_clean.apply(self._process_text)
            
        return X_clean
    
    def _process_text(self, text):
        tokens = text.split()
        
        if self.stop_words_:
            tokens = [t for t in tokens if t.lower() not in self.stop_words_]
            
        if self.stemming and self.stemmer_:
            tokens = [self.stemmer_.stem(t) for t in tokens]
            
        if self.lemmatization and self.lemmatizer_:
            tokens = [self.lemmatizer_.lemmatize(t) for t in tokens]
            
        return " ".join(tokens)

class TextStandardizer(BaseEstimator, TransformerMixin):
    """
    Standardizes text columns: lowercase, strip whitespace.
    """
    def __init__(self, columns=None):
        self.columns = columns

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        cols_to_process = self.columns if self.columns else X.select_dtypes(include=['object']).columns
        
        for col in cols_to_process:
            if col in X.columns:
                X[col] = X[col].astype(str).str.lower().str.strip()
        return X

class DateFeatureExtractor(BaseEstimator, TransformerMixin):
    """
    Extracts Year, Month, Day, Weekday from datetime columns.
    """
    def __init__(self, columns=None):
        self.columns = columns

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        # If columns not specified, try to auto-detect datetime columns (or object columns that look like dates)
        # For safety in a pipeline, it's better if columns are passed explicitly or we check dtypes.
        
        cols_to_process = []
        if self.columns:
            cols_to_process = [c for c in self.columns if c in X.columns]
        else:
            # Auto-detect datetime objects
            cols_to_process = X.select_dtypes(include=['datetime64']).columns.tolist()
            # Also try to convert object columns that look like dates? 
            # For now, let's assume they are already converted or we try to convert.
            for col in X.select_dtypes(include=['object']).columns:
                try:
                    pd.to_datetime(X[col], errors='raise')
                    cols_to_process.append(col)
                except:
                    pass
        
        for col in cols_to_process:
            # Ensure datetime
            if not pd.api.types.is_datetime64_any_dtype(X[col]):
                X[col] = pd.to_datetime(X[col], errors='coerce')
                
            X[f'{col}_year'] = X[col].dt.year
            X[f'{col}_month'] = X[col].dt.month
            X[f'{col}_day'] = X[col].dt.day
            X[f'{col}_weekday'] = X[col].dt.weekday
            
            # Drop original date column? Usually yes for ML models
            # X.drop(columns=[col], inplace=True) 
            # Let's keep it for now or make it an option. 
            # Standard practice: Models can't handle datetime objects, so we should probably drop or leave it for the caller to drop.
            # We'll leave it, but the next steps (Scaling) need to ignore it.
            
        return X

class RareCategoryEncoder(BaseEstimator, TransformerMixin):
    """
    Groups categories that appear less than `threshold` frequency into 'Other'.
    """
    def __init__(self, threshold=0.05, columns=None):
        self.threshold = threshold
        self.columns = columns
        self.frequent_categories_ = {}

    def fit(self, X, y=None):
        cols_to_process = self.columns if self.columns else X.select_dtypes(include=['object', 'category']).columns
        
        for col in cols_to_process:
            if col in X.columns:
                counts = X[col].value_counts(normalize=True)
                self.frequent_categories_[col] = counts[counts >= self.threshold].index.tolist()
        
        return self

    def transform(self, X):
        check_is_fitted(self, 'frequent_categories_')
        X = X.copy()
        
        for col, frequent_cats in self.frequent_categories_.items():
            if col in X.columns:
                X[col] = X[col].apply(lambda x: x if x in frequent_cats else 'Other')
        
        return X

class SkewnessLogTransformer(BaseEstimator, TransformerMixin):
    """
    Applies Log transformation to highly skewed numerical columns.
    """
    def __init__(self, threshold=0.75):
        self.threshold = threshold
        self.skewed_cols_ = []

    def fit(self, X, y=None):
        numeric_cols = X.select_dtypes(include=np.number).columns
        for col in numeric_cols:
            if abs(X[col].skew()) > self.threshold:
                self.skewed_cols_.append(col)
        return self

    def transform(self, X):
        X = X.copy()
        for col in self.skewed_cols_:
            if col in X.columns:
                # Handle negative values by shifting? Or just ignore?
                # Simple log1p
                if (X[col] >= 0).all():
                     X[col] = np.log1p(X[col])
        return X
