// Preprocessing explanations for educational tooltips

export interface PreprocessingExplanation {
    title: string
    description: string
    whenToUse: string
    pros: string[]
    cons: string[]
    codeExample: string
}

export const missingValueExplanations: Record<string, PreprocessingExplanation> = {
    "Drop Rows": {
        title: "Drop Rows with Missing Values",
        description: "Removes all rows that contain any missing values (NaN, null, etc.)",
        whenToUse: "When you have plenty of data and missing values are rare (< 5%)",
        pros: [
            "Simple and fast",
            "No assumptions about missing data",
            "Preserves data distribution for remaining rows"
        ],
        cons: [
            "Loses data (can reduce dataset significantly)",
            "May introduce bias if missing values aren't random",
            "Not suitable for small datasets"
        ],
        codeExample: `df = df.dropna()
# Removes all rows with any missing values`
    },
    "Fill with Mean": {
        title: "Fill Missing Values with Mean",
        description: "Replaces missing values with the mean (average) of each numeric column",
        whenToUse: "When data is normally distributed without outliers",
        pros: [
            "Preserves dataset size",
            "Works well for normally distributed data",
            "Doesn't change the mean of the column"
        ],
        cons: [
            "Only works for numeric columns",
            "Sensitive to outliers",
            "Reduces variance of the data",
            "May not work for skewed distributions"
        ],
        codeExample: `numeric_cols = df.select_dtypes(include=np.number).columns
df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
# Fill each numeric column with its mean value`
    },
    "Fill with Median": {
        title: "Fill Missing Values with Median",
        description: "Replaces missing values with the median (middle value) of each numeric column",
        whenToUse: "When data has outliers or is skewed",
        pros: [
            "Preserves dataset size",
            "Robust to outliers",
            "Works well with skewed distributions"
        ],
        cons: [
            "Only works for numeric columns",
            "Reduces variance slightly",
            "May not preserve distribution shape"
        ],
        codeExample: `numeric_cols = df.select_dtypes(include=np.number).columns
df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
# Fill each numeric column with its median value`
    },
    "Fill with Mode": {
        title: "Fill Missing Values with Mode",
        description: "Replaces missing values with the mode (most frequent value) of each column",
        whenToUse: "For categorical data or discrete numeric values",
        pros: [
            "Preserves dataset size",
            "Works for both numeric and categorical data",
            "Good for discrete/categorical variables"
        ],
        cons: [
            "May introduce bias toward common values",
            "Not suitable for continuous numeric data",
            "Can fail if no clear mode exists"
        ],
        codeExample: `df = df.fillna(df.mode().iloc[0])
# Fill with most frequent value in each column`
    },
    "Forward Fill": {
        title: "Forward Fill",
        description: "Propagates the last valid observation forward to next valid",
        whenToUse: "Time series data where values persist over time",
        pros: ["Preserves trends in time series", "Simple logic"],
        cons: ["Can propagate errors", "Not suitable for non-sequential data"],
        codeExample: `df.fillna(method='ffill', inplace=True)`
    },
    "Backward Fill": {
        title: "Backward Fill",
        description: "Uses next valid observation to fill gap",
        whenToUse: "Time series data (less common than forward fill)",
        pros: ["Preserves trends", "Simple logic"],
        cons: ["Peeks into the future (data leakage risk)", "Not suitable for non-sequential data"],
        codeExample: `df.fillna(method='bfill', inplace=True)`
    }
}

export const encodingExplanations: Record<string, PreprocessingExplanation> = {
    "Label Encoding": {
        title: "Label Encoding",
        description: "Converts categorical values to integers (e.g., 'red'→0, 'blue'→1, 'green'→2)",
        whenToUse: "For ordinal data or tree-based models (Random Forest, XGBoost)",
        pros: [
            "Memory efficient (doesn't create new columns)",
            "Works well with tree-based algorithms",
            "Fast and simple"
        ],
        cons: [
            "Implies order/magnitude (0 < 1 < 2)",
            "Not suitable for linear models",
            "May confuse some algorithms about relationships"
        ],
        codeExample: `from sklearn.preprocessing import LabelEncoder

for col in categorical_columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
# Converts each categorical column to integers`
    },
    "One-Hot Encoding": {
        title: "One-Hot Encoding",
        description: "Creates binary columns for each category (e.g., 'red'→[1,0,0], 'blue'→[0,1,0])",
        whenToUse: "For nominal data with linear models (Logistic Regression, Neural Networks)",
        pros: [
            "No implied order between categories",
            "Works well with linear models",
            "Captures all category information independently"
        ],
        cons: [
            "Creates many new columns (curse of dimensionality)",
            "Memory intensive for high-cardinality features",
            "Can slow down training"
        ],
        codeExample: `df = pd.get_dummies(df, columns=categorical_columns)
# Creates binary column for each unique category
# e.g., 'color' → 'color_red', 'color_blue', 'color_green'`
    },
    "Target Encoding": {
        title: "Target Encoding",
        description: "Replaces categories with the mean of the target variable for that category.",
        whenToUse: "High cardinality categorical features in supervised learning",
        pros: ["Handles high cardinality well", "Doesn't increase dimensionality"],
        cons: ["Risk of overfitting (data leakage)", "Requires a target variable"],
        codeExample: `from category_encoders import TargetEncoder
encoder = TargetEncoder(cols=cols)
df[cols] = encoder.fit_transform(df[cols], y)`
    },
    "Frequency Encoding": {
        title: "Frequency Encoding",
        description: "Replaces categories with their frequency (percentage) in the dataset.",
        whenToUse: "High cardinality features where frequency is informative",
        pros: ["Simple", "No increase in dimensionality"],
        cons: ["Loss of category identity (collisions if frequencies are same)"],
        codeExample: `freq = df[col].value_counts(normalize=True)
df[col] = df[col].map(freq)`
    },
    "None": {
        title: "No Encoding",
        description: "Skip encoding - keep categorical columns as-is",
        whenToUse: "When your data has no categorical columns or you'll encode later",
        pros: [
            "No changes to data",
            "Preserves original format"
        ],
        cons: [
            "Most ML algorithms can't handle text directly",
            "You'll need to encode manually later"
        ],
        codeExample: `# No encoding applied
# Keep categorical columns in original format`
    }
}

export const scalingExplanations: Record<string, PreprocessingExplanation> = {
    "StandardScaler": {
        title: "Standard Scaler (Z-score Normalization)",
        description: "Scales data to have mean=0 and standard deviation=1",
        whenToUse: "When features have different units and data is normally distributed",
        pros: [
            "Works well with most ML algorithms",
            "Handles different scales (e.g., age vs income)",
            "Preserves outlier information"
        ],
        cons: [
            "Sensitive to outliers",
            "Assumes roughly normal distribution",
            "Output not bounded to specific range"
        ],
        codeExample: `from sklearn.preprocessing import StandardScaler

# Transforms to range [0, 1]
# Formula: (x - min) / (max - min)`
    },
    "RobustScaler": {
        title: "Robust Scaler",
        description: "Scales data using statistics that are robust to outliers (IQR).",
        whenToUse: "When data contains many outliers",
        pros: ["Robust to outliers", "Preserves data structure"],
        cons: ["Doesn't scale to a fixed range"],
        codeExample: `from sklearn.preprocessing import RobustScaler
scaler = RobustScaler()
df[cols] = scaler.fit_transform(df[cols])`
    },
    "None": {
        title: "No Scaling",
        description: "Skip scaling - keep numeric values as-is",
        whenToUse: "For tree-based models or when features already have similar scales",
        pros: [
            "Preserves original values",
            "No transformation needed",
            "Good for tree-based models (they're scale-invariant)"
        ],
        cons: [
            "Poor performance with distance-based algorithms",
            "Features with larger values dominate",
            "Not suitable for neural networks or SVM"
        ],
        codeExample: `# No scaling applied
# Numeric columns keep original values`
    }
}

export const outlierExplanations: Record<string, PreprocessingExplanation> = {
    "Z-Score": {
        title: "Z-Score Method",
        description: "Removes rows where any numeric value is more than 3 standard deviations from the mean.",
        whenToUse: "When data is normally distributed",
        pros: [
            "Effective for normally distributed data",
            "Standard statistical method"
        ],
        cons: [
            "Assumes normal distribution",
            "Mean and SD are sensitive to outliers themselves"
        ],
        codeExample: `from scipy import stats
z_scores = np.abs(stats.zscore(df))
df_clean = df[(z_scores < 3).all(axis=1)]`
    },
    "IQR": {
        title: "Interquartile Range (IQR)",
        description: "Removes rows with values outside [Q1 - 1.5*IQR, Q3 + 1.5*IQR].",
        whenToUse: "When data is skewed or distribution is unknown",
        pros: [
            "Robust to outliers",
            "Does not assume normal distribution"
        ],
        cons: [
            "Can be aggressive in removing data"
        ],
        codeExample: `Q1 = df.quantile(0.25)
Q3 = df.quantile(0.75)
IQR = Q3 - Q1
df_clean = df[~((df < (Q1 - 1.5 * IQR)) | (df > (Q3 + 1.5 * IQR))).any(axis=1)]`
    },
    "Cap Outliers": {
        title: "Cap Outliers (Winsorization)",
        description: "Caps values at the 5th and 95th percentiles instead of removing them.",
        whenToUse: "When you want to keep all data points but limit the effect of extremes",
        pros: ["Preserves data size", "Reduces outlier impact"],
        cons: ["Modifies original data values", "Can distort distribution tails"],
        codeExample: `lower = df[col].quantile(0.05)
upper = df[col].quantile(0.95)
df[col] = np.where(df[col] < lower, lower, df[col])
df[col] = np.where(df[col] > upper, upper, df[col])`
    },
    "None": {
        title: "Keep Outliers",
        description: "Do not remove any rows based on outlier detection.",
        whenToUse: "When outliers are valid data points",
        pros: ["Preserves all data"],
        cons: ["Outliers may skew models"],
        codeExample: `# No outlier removal`
    }
}

export const featureEngineeringExplanations: Record<string, PreprocessingExplanation> = {
    "Polynomial Features": {
        title: "Polynomial Features",
        description: "Generates new features by taking all polynomial combinations of the features with degree 2.",
        whenToUse: "To capture non-linear relationships",
        pros: [
            "Captures non-linear relationships",
            "Captures interactions between features"
        ],
        cons: [
            "Significantly increases number of features",
            "Can lead to overfitting"
        ],
        codeExample: `from sklearn.preprocessing import PolynomialFeatures
poly = PolynomialFeatures(degree=2, include_bias=False)
X_poly = poly.fit_transform(X)`
    },
    "Date Features": {
        title: "Date Feature Extraction",
        description: "Extracts Year, Month, Day, and Weekday from datetime columns.",
        whenToUse: "When you have date/time columns",
        pros: ["Makes dates usable for ML models", "Captures seasonality"],
        cons: ["Increases dimensionality slightly"],
        codeExample: `df['year'] = df['date'].dt.year
df['month'] = df['date'].dt.month`
    },
    "Text Features": {
        title: "Text Standardization",
        description: "Converts text to lowercase and strips whitespace.",
        whenToUse: "For string columns that need cleaning",
        pros: ["Reduces noise", "Unifies categories (e.g., 'Red' vs 'red')"],
        cons: ["Loss of casing information"],
        codeExample: `df[col] = df[col].str.lower().str.strip()`
    },
    "Rare Categories": {
        title: "Rare Category Handling",
        description: "Groups categories with < 5% frequency into 'Other'.",
        whenToUse: "High cardinality features with many rare levels",
        pros: ["Reduces noise", "Prevents overfitting to rare events"],
        cons: ["Loss of fine-grained information"],
        codeExample: `counts = df[col].value_counts(normalize=True)
rare = counts[counts < 0.05].index
df[col] = df[col].replace(rare, 'Other')`
    },
    "None": {
        title: "No Feature Engineering",
        description: "Use original features only.",
        whenToUse: "When model complexity needs to be low",
        pros: ["Simpler model", "Less risk of overfitting"],
        cons: ["May miss complex relationships"],
        codeExample: `# No feature engineering`
    }
}

export const featureSelectionExplanations: Record<string, PreprocessingExplanation> = {
    "High Correlation": {
        title: "Remove High Correlation",
        description: "Removes features that have a correlation > 0.95 with other features.",
        whenToUse: "To reduce multicollinearity",
        pros: ["Reduces redundancy", "Improves model stability"],
        cons: ["Might remove useful features"],
        codeExample: `corr = df.corr().abs()
upper = corr.where(np.triu(np.ones(corr.shape), k=1).astype(bool))
to_drop = [c for c in upper.columns if any(upper[c] > 0.95)]
df.drop(columns=to_drop, inplace=True)`
    },
    "Low Variance": {
        title: "Low Variance Filtering",
        description: "Removes features with very low variance (constant or near-constant).",
        whenToUse: "To remove uninformative features",
        pros: ["Removes useless features", "Reduces dimensionality"],
        cons: ["Might remove features with subtle signals"],
        codeExample: `from sklearn.feature_selection import VarianceThreshold
selector = VarianceThreshold(threshold=0.01)
selector.fit(df)`
    }
}

export const targetExplanations: Record<string, PreprocessingExplanation> = {
    "SMOTE": {
        title: "SMOTE Oversampling",
        description: "Synthetic Minority Over-sampling Technique. Generates synthetic samples for the minority class.",
        whenToUse: "Imbalanced classification datasets",
        pros: ["Balances classes", "Improves recall for minority class"],
        cons: ["Can introduce noise", "Risk of overfitting"],
        codeExample: `from imblearn.over_sampling import SMOTE
smote = SMOTE()
X_res, y_res = smote.fit_resample(X, y)`
    }
}
