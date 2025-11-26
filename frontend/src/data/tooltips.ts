// Tooltip content for technical terms throughout the application
export const tooltips = {
    // General preprocessing terms
    missing_values: "Data points with no recorded value (NaN, null, empty strings). Most ML algorithms cannot handle missing data.",
    outliers: "Values significantly different from other observations, typically more than 3 standard deviations from the mean.",
    scaling: "Transforming features to similar ranges to prevent features with larger values from dominating the model.",
    encoding: "Converting categorical text values into numerical format that machine learning algorithms can process.",

    // Specific methods
    standard_scaler: "Standardizes features by removing the mean and scaling to unit variance. Result has mean=0, std=1.",
    minmax_scaler: "Scales features to a fixed range [0, 1] by subtracting the minimum and dividing by the range.",
    label_encoding: "Assigns each unique category a number (0, 1, 2, ...). Best for ordinal data.",
    onehot_encoding: "Creates binary columns for each category. Best for nominal data with no ordering.",

    // Advanced techniques
    smote: "Synthetic Minority Oversampling Technique - creates synthetic examples of the minority class to balance datasets.",
    feature_selection: "Process of selecting the most relevant features to improve model performance and reduce complexity.",
    train_test_split: "Dividing data into training set (for model learning) and test set (for unbiased evaluation).",
    stratify: "Maintain the same proportion of target classes in both train and test sets. Important for imbalanced datasets.",

    // Text processing
    tokenization: "Splitting text into individual words or tokens for analysis.",
    stopwords: "Common words (the, is, at) that provide little meaningful information and are often removed.",
    lemmatization: "Converting words to their dictionary base form (running → run, better → good).",
    stemming: "Reducing words to their root form by removing suffixes (running → run). Faster but less accurate than lemmatization.",
    tfidf: "Term Frequency-Inverse Document Frequency - weights words by importance in a document relative to the corpus.",

    // Image processing
    image_normalization: "Scaling pixel values to a standard range (usually 0-1) for faster neural network training.",
    data_augmentation: "Creating variations of training images (flip, rotate, crop) to increase dataset size and reduce overfitting.",

    // Audio processing  
    sample_rate: "Number of audio samples per second (Hz). Higher rates capture more detail but use more space.",
    mfcc: "Mel-Frequency Cepstral Coefficients - compact representation of audio that captures important characteristics.",
    spectrogram: "Visual representation of audio frequencies over time, often used as input to neural networks.",

    // Metrics
    correlation: "Statistical measure of how two variables move together. High correlation (>0.95) indicates redundancy.",
    variance: "Measure of spread in data. Low variance features provide little discriminative information.",

    // Quality
    data_quality: "Overall health of the dataset based on missing values, outliers, duplicates, and consistency.",
}

export type TooltipKey = keyof typeof tooltips
