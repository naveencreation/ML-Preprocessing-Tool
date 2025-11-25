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
    "None": {
        title: "No Feature Engineering",
        description: "Use original features only.",
        whenToUse: "When model complexity needs to be low",
        pros: ["Simpler model", "Less risk of overfitting"],
        cons: ["May miss complex relationships"],
        codeExample: `# No feature engineering`
    }
}
