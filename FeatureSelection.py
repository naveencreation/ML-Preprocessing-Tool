import streamlit as st
import pandas as pd
from sklearn.feature_selection import RFE
from sklearn.linear_model import LinearRegression
from scipy.stats import pearsonr
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.preprocessing import LabelEncoder

# Streamlit app for feature selection
def FeatureSelection():
    st.markdown("""<h1 style='color:#87CEEB;'>Feature Selection</h1>""", unsafe_allow_html=True)
    
    st.write("Upload a dataset and select relevant features using various feature selection methods.")

    # File uploader
    uploaded_file = st.file_uploader("Upload your CSV or Excel file", type=["csv", "xlsx"])

    if uploaded_file:
        # Load dataset
        if uploaded_file.name.endswith('.csv'):
            df = pd.read_csv(uploaded_file)
        elif uploaded_file.name.endswith('.xlsx'):
            df = pd.read_excel(uploaded_file)
        else:
            st.error("Unsupported file type")
            return

        st.subheader("Original Dataset")
        st.write(df)

        # Handle Categorical Data: Convert categorical columns to numeric
        label_encoder = LabelEncoder()
        categorical_columns = df.select_dtypes(include=["object"]).columns

        for col in categorical_columns:
            df[col] = label_encoder.fit_transform(df[col])

        st.subheader("Converted Dataset with Categorical Columns Encoded")
        st.write(df)

        # Select target variable (dependent variable)
        st.subheader("Select Target Variable")
        target_column = st.selectbox("Select the target variable (dependent variable)", df.columns)

        # Feature Selection Method
        st.subheader("Select Feature Selection Method")

        # Option for Correlation Matrix
        if st.checkbox("Remove Features Using Correlation Matrix"):
            # Filter out non-numeric columns
            numeric_df = df.select_dtypes(include=["number"])

            # Calculate the correlation matrix
            corr_matrix = numeric_df.corr()

            # Create the plot figure and axis explicitly
            fig, ax = plt.subplots(figsize=(10, 8))

            # Create the heatmap
            sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', fmt='.2f', ax=ax)

            # Display the heatmap in the Streamlit app
            st.pyplot(fig)  # Pass the 'fig' object to st.pyplot()

            # Get highly correlated features
            threshold = st.slider("Set correlation threshold", min_value=0.0, max_value=1.0, value=0.9, step=0.01)
            correlated_features = []
            for i in range(len(corr_matrix.columns)):
                for j in range(i):
                    if abs(corr_matrix.iloc[i, j]) > threshold:
                        colname = corr_matrix.columns[i]
                        correlated_features.append(colname)
            correlated_features = list(set(correlated_features))
            st.write(f"Highly correlated features (threshold > {threshold}): {correlated_features}")
            df = df.drop(columns=correlated_features)
            st.success(f"Removed {len(correlated_features)} highly correlated features.")

        # Option for Recursive Feature Elimination (RFE)
        if st.checkbox("Remove Features Using Recursive Feature Elimination (RFE)"):
            X = df.drop(columns=[target_column])
            y = df[target_column]

            # Perform RFE
            model = LinearRegression()
            rfe = RFE(model, n_features_to_select=st.slider("Select the number of features to keep", min_value=1, max_value=len(X.columns), value=5))
            fit = rfe.fit(X, y)

            # Display selected features
            selected_features = X.columns[fit.support_]
            st.write(f"Selected features after RFE: {list(selected_features)}")

            # Remove unselected features
            df = df[selected_features.tolist() + [target_column]]
            st.success("Features selected using RFE.")

        # Option for Statistical Tests (e.g., Pearson Correlation)
        if st.checkbox("Remove Features Using Statistical Tests (e.g., Pearson Correlation)"):
            # Perform Pearson Correlation Test for each feature
            X = df.drop(columns=[target_column])
            correlations = {}
            for column in X.columns:
                correlation, _ = pearsonr(X[column], df[target_column])
                correlations[column] = correlation

            # Display features with correlation values
            st.write("Correlation values between features and the target:")
            for feature, correlation in correlations.items():
                st.write(f"{feature}: {correlation:.2f}")

            # Remove features with low correlation
            min_correlation = st.slider("Set minimum correlation value with target", min_value=-1.0, max_value=1.0, value=0.1, step=0.01)
            low_correlation_features = [feature for feature, correlation in correlations.items() if abs(correlation) < min_correlation]
            df = df.drop(columns=low_correlation_features)
            st.success(f"Removed {len(low_correlation_features)} features with low correlation to the target.")

        # Display updated dataset
        st.subheader("Updated Dataset")
        st.write(df)

        # Download the updated dataset
        st.download_button(
            label="Download Selected Features Dataset",
            data=df.to_csv(index=False),
            file_name="selected_features_dataset.csv",
            mime="text/csv"
        )

    else:
        st.info("Please upload a dataset to begin.")

