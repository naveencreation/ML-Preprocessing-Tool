import pandas as pd
import re
import string
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer

# Download necessary NLTK data (safe to run multiple times)
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('tokenizers/punkt_tab')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('punkt_tab')
    nltk.download('stopwords')
    nltk.download('wordnet')
    nltk.download('omw-1.4')

from nltk.corpus import stopwords
from nltk.stem import PorterStemmer, WordNetLemmatizer
from nltk.tokenize import word_tokenize

def process_text_data(
    df: pd.DataFrame,
    # Text Options
    text_column: str = None, # The column containing text to process
    text_cleaning_method: str = "None",
    stopword_removal: bool = False,
    stemming: bool = False,
    lemmatization: bool = False,
    tokenization: bool = False,
    vectorization_method: str = "None",
    # General Options (if applicable)
    missing_option: str = "Drop Rows",
) -> pd.DataFrame:
    """
    Text preprocessing service.
    Assumes the dataset has a specific column with text data to process.
    If text_column is not provided, it tries to find the first object column.
    """
    df = df.copy()
    
    # Identify text column
    if not text_column:
        # Default to first object column if not specified
        object_cols = df.select_dtypes(include=['object']).columns
        if not object_cols.empty:
            text_column = object_cols[0]
        else:
            return df # No text column found
            
    if text_column not in df.columns:
        return df

    # Ensure column is string
    df[text_column] = df[text_column].astype(str)

    # --- 1. Cleaning ---
    if text_cleaning_method != "None":
        def clean_text(text):
            text = text.lower()
            if text_cleaning_method == "Advanced":
                text = re.sub(r'\[.*?\]', '', text) # Remove text in brackets
                text = re.sub(r'https?://\S+|www\.\S+', '', text) # Remove URLs
                text = re.sub(r'<.*?>+', '', text) # Remove HTML tags
                text = re.sub(r'[%s]' % re.escape(string.punctuation), '', text) # Remove punctuation
                text = re.sub(r'\n', '', text) # Remove newlines
                text = re.sub(r'\w*\d\w*', '', text) # Remove words containing numbers
            else: # Simple
                text = re.sub(r'[^\w\s]', '', text) # Remove punctuation
            return text
        
        df[text_column] = df[text_column].apply(clean_text)

    # --- 2. Tokenization ---
    # We tokenize if requested OR if needed for subsequent steps (stem/lemma/stopword)
    if tokenization or stopword_removal or stemming or lemmatization:
        df[f'{text_column}_tokens'] = df[text_column].apply(lambda x: word_tokenize(x))
        working_col = f'{text_column}_tokens'
    else:
        working_col = text_column

    # --- 3. Stopword Removal ---
    if stopword_removal:
        stop_words = set(stopwords.words('english'))
        # Ensure we are working with tokens
        if working_col == text_column:
             df[f'{text_column}_tokens'] = df[text_column].apply(lambda x: word_tokenize(x))
             working_col = f'{text_column}_tokens'
             
        df[working_col] = df[working_col].apply(lambda x: [word for word in x if word not in stop_words])

    # --- 4. Stemming / Lemmatization ---
    if stemming:
        stemmer = PorterStemmer()
        if working_col == text_column:
             df[f'{text_column}_tokens'] = df[text_column].apply(lambda x: word_tokenize(x))
             working_col = f'{text_column}_tokens'
        df[working_col] = df[working_col].apply(lambda x: [stemmer.stem(word) for word in x])
        
    elif lemmatization:
        lemmatizer = WordNetLemmatizer()
        if working_col == text_column:
             df[f'{text_column}_tokens'] = df[text_column].apply(lambda x: word_tokenize(x))
             working_col = f'{text_column}_tokens'
        df[working_col] = df[working_col].apply(lambda x: [lemmatizer.lemmatize(word) for word in x])

    # --- Reconstruct Text if needed for Vectorization ---
    if vectorization_method != "None":
        if working_col != text_column:
            # Join tokens back to string
            df[f'{text_column}_processed'] = df[working_col].apply(lambda x: ' '.join(x) if isinstance(x, list) else x)
            target_col = f'{text_column}_processed'
        else:
            target_col = text_column
            
        if vectorization_method == "TF-IDF":
            vectorizer = TfidfVectorizer(max_features=100) # Limit features to avoid explosion
            vectors = vectorizer.fit_transform(df[target_col])
            feature_names = vectorizer.get_feature_names_out()
            df_vectors = pd.DataFrame(vectors.toarray(), columns=[f"tfidf_{f}" for f in feature_names], index=df.index)
            df = pd.concat([df, df_vectors], axis=1)
            
        elif vectorization_method == "Count":
            vectorizer = CountVectorizer(max_features=100)
            vectors = vectorizer.fit_transform(df[target_col])
            feature_names = vectorizer.get_feature_names_out()
            df_vectors = pd.DataFrame(vectors.toarray(), columns=[f"count_{f}" for f in feature_names], index=df.index)
            df = pd.concat([df, df_vectors], axis=1)

    return df
