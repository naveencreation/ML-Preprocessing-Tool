// Preprocessing steps data with educational content
// This centralizes all the educational information for each preprocessing step

export interface PreprocessingStepData {
    id: string
    title: string
    description: string
    whyItMatters: string
    whenToUse: string
    industryExample: string
    codeSnippet: string
    order: number
    parameterOptions?: {
        name: string
        type: 'select' | 'number' | 'boolean'
        options?: string[]
        default: any
        description: string
    }[]
}

export const datasetSteps: PreprocessingStepData[] = [
    {
        id: 'missing_values',
        title: 'Handle Missing Values',
        description: 'Replace or remove missing data (NaN, null, empty values) in your dataset.',
        whyItMatters: 'Most machine learning algorithms cannot process missing values. If left unhandled, they cause errors or biased predictions.',
        whenToUse: 'Always check for missing values before training any ML model. Use this step after data loading and before any transformations.',
        industryExample: 'In house price prediction, missing "lot_size" values can be filled with the neighborhood median, while missing "price" (target) rows should be dropped.',
        codeSnippet: `# Handle missing values
import pandas as pd
from sklearn.impute import SimpleImputer

# Strategy: 'mean', 'median', 'most_frequent', 'constant'
imputer = SimpleImputer(strategy='mean')
df[numeric_cols] = imputer.fit_transform(df[numeric_cols])

# For categorical columns
imputer_cat = SimpleImputer(strategy='most_frequent')
df[categorical_cols] = imputer_cat.fit_transform(df[categorical_cols])`,
        order: 1,
        parameterOptions: [
            {
                name: 'strategy',
                type: 'select',
                options: ['Drop Rows', 'Fill with Mean', 'Fill with Median', 'Fill with Mode', 'Forward Fill', 'KNN Imputation'],
                default: 'Fill with Mean',
                description: 'Method to handle missing values'
            }
        ]
    },
    {
        id: 'encoding',
        title: 'Encode Categorical Variables',
        description: 'Convert text categories (like "red", "blue", "green") into numerical values that ML models can process.',
        whyItMatters: 'Machine learning models only understand numbers. Categorical variables must be converted to numerical format.',
        whenToUse: 'After handling missing values, before scaling. Only apply to categorical columns, not numerical ones.',
        industryExample: 'In fraud detection, encode "transaction_type" (online, in-store, ATM) as 0, 1, 2 for model training.',
        codeSnippet: `# Categorical encoding
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
import pandas as pd

# Label Encoding (for ordinal categories)
le = LabelEncoder()
df['category_encoded'] = le.fit_transform(df['category'])

# One-Hot Encoding (for nominal categories)
df_encoded = pd.get_dummies(df, columns=['category'], prefix='cat')`,
        order: 2,
        parameterOptions: [
            {
                name: 'method',
                type: 'select',
                options: ['Label Encoding', 'One-Hot Encoding', 'Target Encoding'],
                default: 'One-Hot Encoding',
                description: 'Encoding method for categorical variables'
            }
        ]
    },
    {
        id: 'scaling',
        title: 'Scale Numerical Features',
        description: 'Normalize numerical features to a similar range (e.g., 0-1 or mean=0, std=1) so no single feature dominates.',
        whyItMatters: 'Features on different scales (e.g., age: 20-80, income: 20,000-200,000) can cause algorithms like gradient descent to converge slowly or poorly.',
        whenToUse: 'After encoding, before training. Essential for distance-based algorithms (KNN, SVM) and neural networks. Less critical for tree-based models.',
        industryExample: 'In loan approval prediction, scale "income" ($20k-$200k) and "age" (18-65) to prevent income from dominating the model.',
        codeSnippet: `# Feature scaling
from sklearn.preprocessing import StandardScaler, MinMaxScaler

# StandardScaler: mean=0, std=1
scaler = StandardScaler()
df[numeric_cols] = scaler.fit_transform(df[numeric_cols])

# MinMaxScaler: scale to [0, 1]
scaler = MinMaxScaler()
df[numeric_cols] = scaler.fit_transform(df[numeric_cols])`,
        order: 3,
        parameterOptions: [
            {
                name: 'method',
                type: 'select',
                options: ['StandardScaler', 'MinMaxScaler', 'RobustScaler', 'None'],
                default: 'StandardScaler',
                description: 'Scaling method for numerical features'
            }
        ]
    },
    {
        id: 'outliers',
        title: 'Detect and Handle Outliers',
        description: 'Identify and manage extreme values that are significantly different from other observations.',
        whyItMatters: 'Outliers can skew statistical measures and negatively impact model training, especially for algorithms sensitive to extreme values.',
        whenToUse: 'After scaling, when you notice extreme values in your data distribution. Not always necessary for tree-based models.',
        industryExample: 'In salary prediction, a CEO earning $10M is an outlier among employees earning $50k-$150k. Cap or remove it to prevent skewing the model.',
        codeSnippet: `# Outlier detection and handling
import numpy as np
from scipy import stats

# Z-Score method (remove if |z| > 3)
z_scores = np.abs(stats.zscore(df[numeric_cols]))
df = df[(z_scores < 3).all(axis=1)]

# IQR method
Q1 = df[col].quantile(0.25)
Q3 = df[col].quantile(0.75)
IQR = Q3 - Q1
df = df[(df[col] >= Q1 - 1.5*IQR) & (df[col] <= Q3 + 1.5*IQR)]`,
        order: 4,
        parameterOptions: [
            {
                name: 'method',
                type: 'select',
                options: ['None', 'Z-Score', 'IQR', 'Cap Outliers'],
                default: 'None',
                description: 'Method to detect and handle outliers'
            }
        ]
    },
    {
        id: 'feature_selection',
        title: 'Select Important Features',
        description: 'Remove irrelevant, redundant, or low-variance features to improve model performance and reduce overfitting.',
        whyItMatters: 'Irrelevant features add noise and computational cost. Correlated features provide redundant information. Feature selection improves model interpretability and performance.',
        whenToUse: 'After all transformations, before train-test split. Use when you have many features (high-dimensional data).',
        industryExample: 'In spam detection, if "word_count" and "character_count" are 99% correlated, keep only one to avoid multicollinearity.',
        codeSnippet: `# Feature selection
from sklearn.feature_selection import VarianceThreshold, SelectKBest, f_classif

# Remove low variance features
selector = VarianceThreshold(threshold=0.01)
df_selected = selector.fit_transform(df)

# Remove highly correlated features
corr_matrix = df.corr().abs()
upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
to_drop = [col for col in upper.columns if any(upper[col] > 0.95)]
df = df.drop(columns=to_drop)`,
        order: 5,
        parameterOptions: [
            {
                name: 'remove_high_correlation',
                type: 'boolean',
                default: false,
                description: 'Remove features with correlation > 0.95'
            },
            {
                name: 'low_variance_filtering',
                type: 'boolean',
                default: false,
                description: 'Remove features with low variance'
            }
        ]
    },
    {
        id: 'train_test_split',
        title: 'Split into Train and Test Sets',
        description: 'Divide your dataset into training data (for model learning) and test data (for evaluation).',
        whyItMatters: 'Testing on the same data used for training leads to overfitting. A separate test set provides an unbiased evaluation of model performance.',
        whenToUse: 'Final step before training. Standard split is 80% train, 20% test. For small datasets, use cross-validation.',
        industryExample: 'In customer churn prediction, use stratified split to maintain the same proportion of churned/active customers in both train and test sets.',
        codeSnippet: `# Train-test split
from sklearn.model_selection import train_test_split

# Basic split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Stratified split (for imbalanced datasets)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)`,
        order: 6,
        parameterOptions: [
            {
                name: 'test_size',
                type: 'number',
                default: 0.2,
                description: 'Proportion of data for testing (0.1 - 0.5)'
            },
            {
                name: 'stratify',
                type: 'boolean',
                default: false,
                description: 'Maintain class distribution in splits'
            }
        ]
    }
]

export const textSteps: PreprocessingStepData[] = [
    {
        id: 'text_cleaning',
        title: 'Clean and Normalize Text',
        description: 'Remove noise like URLs, HTML tags, special characters, and convert to lowercase.',
        whyItMatters: 'Raw text contains irrelevant information that adds noise. Cleaning reduces vocabulary size and improves model focus.',
        whenToUse: 'First step in text preprocessing. Always apply before tokenization.',
        industryExample: 'In sentiment analysis of tweets, remove @mentions, #hashtags, and URLs to focus on actual sentiment-bearing words.',
        codeSnippet: `# Text cleaning
import re
import string

def clean_text(text):
    # Lowercase
    text = text.lower()
    # Remove URLs
    text = re.sub(r'https?://\\S+|www\\.\\S+', '', text)
    # Remove HTML tags
    text = re.sub(r'<.*?>', '', text)
    # Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text

df['cleaned_text'] = df['text'].apply(clean_text)`,
        order: 1,
        parameterOptions: [
            {
                name: 'method',
                type: 'select',
                options: ['None', 'Simple', 'Advanced'],
                default: 'Simple',
                description: 'Level of text cleaning'
            }
        ]
    },
    {
        id: 'tokenization',
        title: 'Tokenize Text',
        description: 'Split text into individual words or tokens for analysis.',
        whyItMatters: 'Tokenization is the foundation for all downstream NLP tasks. It breaks text into units that can be analyzed.',
        whenToUse: 'After cleaning, before stopword removal and lemmatization.',
        industryExample: 'In document classification, tokenize "Machine learning is amazing" into ["Machine", "learning", "is", "amazing"].',
        codeSnippet: `# Tokenization
from nltk.tokenize import word_tokenize
import nltk

nltk.download('punkt')

# Word tokenization
df['tokens'] = df['text'].apply(word_tokenize)

# Result: "Hello world!" -> ["Hello", "world", "!"]`,
        order: 2
    },
    {
        id: 'stopword_removal',
        title: 'Remove Stopwords',
        description: 'Filter out common words like "the", "is", "at" that carry little meaning.',
        whyItMatters: 'Stopwords are frequent but provide little discriminative information. Removing them reduces feature space and focuses on meaningful words.',
        whenToUse: 'After tokenization. Not always beneficial for all tasks (e.g., skip for sentiment analysis where "not" is important).',
        industryExample: 'In topic modeling, remove stopwords so topics are defined by meaningful keywords like "finance", "investment", not "the", "and".',
        codeSnippet: `# Stopword removal
from nltk.corpus import stopwords
import nltk

nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

df['filtered_tokens'] = df['tokens'].apply(
    lambda x: [word for word in x if word.lower() not in stop_words]
)`,
        order: 3,
        parameterOptions: [
            {
                name: 'enabled',
                type: 'boolean',
                default: true,
                description: 'Remove common stopwords'
            }
        ]
    },
    {
        id: 'lemmatization',
        title: 'Lemmatize Words',
        description: 'Convert words to their base dictionary form (e.g., "running" → "run", "better" → "good").',
        whyItMatters: 'Different forms of the same word carry the same meaning. Lemmatization reduces vocabulary while preserving meaning.',
        whenToUse: 'After stopword removal. Choose lemmatization for better accuracy, stemming for speed.',
        industryExample: 'In customer review analysis, treat "loved", "loving", "loves" as the same word "love" to better capture sentiment.',
        codeSnippet: `# Lemmatization
from nltk.stem import WordNetLemmatizer
import nltk

nltk.download('wordnet')
lemmatizer = WordNetLemmatizer()

df['lemmatized'] = df['tokens'].apply(
    lambda x: [lemmatizer.lemmatize(word) for word in x]
)

# "running" -> "run", "better" -> "good"`,
        order: 4,
        parameterOptions: [
            {
                name: 'method',
                type: 'select',
                options: ['None', 'Stemming', 'Lemmatization'],
                default: 'Lemmatization',
                description: 'Word normalization method'
            }
        ]
    },
    {
        id: 'vectorization',
        title: 'Vectorize Text',
        description: 'Convert text into numerical vectors that machine learning models can process.',
        whyItMatters: 'ML models require numerical input. Vectorization transforms text into feature vectors while preserving semantic information.',
        whenToUse: 'Final step after all text transformations. Choice depends on task (TF-IDF for classification, Word2Vec for semantic similarity).',
        industryExample: 'In spam detection, use TF-IDF to convert emails into vectors where rare words in spam get higher weights.',
        codeSnippet: `# Text vectorization
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer

# TF-IDF (Term Frequency-Inverse Document Frequency)
vectorizer = TfidfVectorizer(max_features=1000)
X = vectorizer.fit_transform(df['processed_text'])

# Count Vectorizer (Bag of Words)
count_vec = CountVectorizer(max_features=1000)
X = count_vec.fit_transform(df['processed_text'])`,
        order: 5,
        parameterOptions: [
            {
                name: 'method',
                type: 'select',
                options: ['TF-IDF', 'Count Vectorizer', 'Word2Vec'],
                default: 'TF-IDF',
                description: 'Vectorization method'
            },
            {
                name: 'max_features',
                type: 'number',
                default: 1000,
                description: 'Maximum number of features'
            }
        ]
    }
]

export const imageSteps: PreprocessingStepData[] = [
    {
        id: 'image_resize',
        title: 'Resize Images',
        description: 'Standardize image dimensions to ensure consistent input for ML models.',
        whyItMatters: 'Neural networks require fixed input dimensions. Inconsistent image sizes will cause errors or require dynamic batching.',
        whenToUse: 'Always resize images when training CNNs or using pre-trained models with specific input requirements.',
        industryExample: 'In medical imaging, resize all X-rays to 224x224 pixels to match ImageNet pre-trained model requirements.',
        codeSnippet: `# Image resizing
from PIL import Image
import numpy as np

def resize_image(image_path, target_size=(224, 224)):
    img = Image.open(image_path)
    img_resized = img.resize(target_size, Image.LANCZOS)
    return np.array(img_resized)

# Batch resize
resized_images = [resize_image(path) for path in image_paths]`,
        order: 1,
        parameterOptions: [
            {
                name: 'width',
                type: 'number',
                default: 224,
                description: 'Target width (pixels)'
            },
            {
                name: 'height',
                type: 'number',
                default: 224,
                description: 'Target height (pixels)'
            }
        ]
    },
    {
        id: 'image_normalize',
        title: 'Normalize Pixel Values',
        description: 'Scale pixel values to a standard range (0-1 or -1 to 1) for faster training.',
        whyItMatters: 'Normalized inputs help neural networks converge faster and avoid gradient explosion/vanishing.',
        whenToUse: 'Always normalize after resizing. Use same normalization as pre-trained model during transfer learning.',
        industryExample: 'In face recognition, normalize pixel values to  0-1 range before feeding to the neural network.',
        codeSnippet: `# Normalize images
import numpy as np

# Scale to [0, 1]
normalized = images / 255.0

# Or use ImageNet normalization (for transfer learning)
mean = np.array([0.485, 0.456, 0.406])
std = np.array([0.229, 0.224, 0.225])
normalized = (images - mean) / std`,
        order: 2
    },
    {
        id: 'image_augment',
        title: 'Data Augmentation',
        description: 'Create variations of images (flip, rotate, crop) to increase training data and reduce overfitting.',
        whyItMatters: 'More diverse training data improves model generalization and reduces overfitting, especially with small datasets.',
        whenToUse: 'When you have limited training data or want to improve model robustness to transformations.',
        industryExample: 'In autonomous driving, augment road images with different lighting, rotation, and crops to handle various driving conditions.',
        codeSnippet: `# Data augmentation
from tensorflow.keras.preprocessing.image import ImageDataGenerator

datagen = ImageDataGenerator(
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    zoom_range=0.2,
    fill_mode='nearest'
)

# Generate augmented images
augmented_images = datagen.flow(images, batch_size=32)`,
        order: 3,
        parameterOptions: [
            {
                name: 'enabled',
                type: 'boolean',
                default: false,
                description: 'Enable data augmentation'
            }
        ]
    }
]

export const audioSteps: PreprocessingStepData[] = [
    {
        id: 'audio_resample',
        title: 'Resample Audio',
        description: 'Standardize sample rate across all audio files for consistent processing.',
        whyItMatters: 'Different sample rates mean different time resolutions. Models expect consistent input frequency.',
        whenToUse: 'When audio files have mixed sample rates (8kHz, 16kHz, 44.1kHz, etc.).',
        industryExample: 'In speech recognition, resample all recordings to 16kHz for consistency with standard ASR models.',
        codeSnippet: `# Audio resampling
import librosa

# Load and resample
audio, sr = librosa.load('audio.wav', sr=16000)

# Or resample existing audio
audio_resampled = librosa.resample(audio, orig_sr=44100, target_sr=16000)`,
        order: 1,
        parameterOptions: [
            {
                name: 'target_sr',
                type: 'number',
                default: 16000,
                description: 'Target sample rate (Hz)'
            }
        ]
    },
    {
        id: 'audio_trim_silence',
        title: 'Trim Silence',
        description: 'Remove silence from beginning and end of audio clips to focus on actual content.',
        whyItMatters: 'Silence adds no information but increases processing time. Trimming improves efficiency and focus.',
        whenToUse: 'When recordings have leading/trailing silence, especially in voice recordings.',
        industryExample: 'In voice command detection, trim silence so models focus only on the spoken command.',
        codeSnippet: `# Trim silence
import librosa

# Trim leading and trailing silence
audio_trimmed, _ = librosa.effects.trim(audio, top_db=20)

# top_db: threshold in decibels below reference to consider as silence`,
        order: 2
    },
    {
        id: 'audio_extract_features',
        title: 'Extract Audio Features',
        description: 'Extract MFCCs, spectrograms, or other features that capture audio characteristics.',
        whyItMatters: 'Raw audio waveforms are high-dimensional. Features like MFCCs capture important patterns in compact form.',
        whenToUse: 'Always extract features before training. Choice depends on task (MFCCs for speech, spectrograms for music).',
        industryExample: 'In music genre classification, extract Mel spectrograms to capture frequency patterns over time.',
        codeSnippet: `# Extract audio features
import librosa

# MFCCs (Mel-frequency cepstral coefficients)
mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)

# Mel Spectrogram
mel_spec = librosa.feature.melspectrogram(y=audio, sr=sr)
mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)`,
        order: 3,
        parameterOptions: [
            {
                name: 'feature_type',
                type: 'select',
                options: ['MFCC', 'Mel Spectrogram', 'Chroma'],
                default: 'MFCC',
                description: 'Type of features to extract'
            }
        ]
    }
]

export const logsSteps: PreprocessingStepData[] = [
    {
        id: 'log_parse_timestamp',
        title: 'Parse Timestamps',
        description: 'Extract and standardize timestamps from log entries for temporal analysis.',
        whyItMatters: 'Timestamps are crucial for understanding log sequences, detecting anomalies, and analyzing system behavior over time.',
        whenToUse: 'Always parse timestamps first to enable time-based analysis and sorting.',
        industryExample: 'In security monitoring, parse timestamps to detect unusual activity patterns during specific time windows.',
        codeSnippet: `# Parse log timestamps
import pandas as pd
from dateutil import parser

# Parse various timestamp formats
df['timestamp'] = df['log_line'].apply(
    lambda x: parser.parse(x.split()[0] + ' ' + x.split()[1])
)

# Convert to datetime
df['timestamp'] = pd.to_datetime(df['timestamp'])
df = df.sort_values('timestamp')`,
        order: 1
    },
    {
        id: 'log_extract_levels',
        title: 'Extract Log Levels',
        description: 'Identify and categorize log severity (ERROR, WARN, INFO, DEBUG).',
        whyItMatters: 'Log levels indicate severity and help prioritize issues. Errors need immediate attention while debug logs are for troubleshooting.',
        whenToUse: 'When analyzing system health or filtering for specific severity levels.',
        industryExample: 'In production monitoring, extract ERROR logs to trigger alerts while filtering out DEBUG logs.',
        codeSnippet: `# Extract log levels
import re

def extract_log_level(log_line):
    levels = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'FATAL']
    for level in levels:
        if level in log_line.upper():
            return level
    return 'UNKNOWN'

df['log_level'] = df['log_line'].apply(extract_log_level)

# Convert to categorical for efficiency
df['log_level'] = df['log_level'].astype('category')`,
        order: 2
    },
    {
        id: 'log_pattern_extraction',
        title: 'Extract Patterns',
        description: 'Identify and extract structured information (IPs, user IDs, error codes) from unstructured logs.',
        whyItMatters: 'Logs contain valuable structured data embedded in text. Extraction enables quantitative analysis and machine learning.',
        whenToUse: 'When logs contain repeated patterns like IP addresses, user IDs, or error codes that need analysis.',
        industryExample: 'In web server logs, extract IP addresses and URLs to analyze traffic patterns and detect potential attacks.',
        codeSnippet: `# Pattern extraction from logs
import re

# Extract IP addresses
df['ip_address'] = df['log_line'].str.extract(r'(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})')

# Extract HTTP status codes
df['status_code'] = df['log_line'].str.extract(r'\\s(\\d{3})\\s')

# Extract user IDs
df['user_id'] = df['log_line'].str.extract(r'user_id=(\\d+)')`,
        order: 3
    }
]

// Data type to steps mapping
export const preprocessingSteps = {
    dataset: datasetSteps,
    text: textSteps,
    image: imageSteps,
    audio: audioSteps,
    logs: logsSteps
}
