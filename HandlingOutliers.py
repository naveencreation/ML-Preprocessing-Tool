import streamlit as st
import pandas as pd
import numpy as np
from scipy.stats import zscore

# Function to handle outliers
def handle_outliers(df, method="Z-score"):
    if method == "Z-score":
        # Calculate Z-scores for numeric columns
        numeric_cols = df.select_dtypes(include=["number"]).columns
        z_scores = np.abs(zscore(df[numeric_cols]))
        
        # Identify outliers (Z-score > 3)
        outliers = (z_scores > 3)
        
        # Mark outliers in the dataframe
        outlier_indices = np.where(outliers)[0]
        df_outliers = df.iloc[outlier_indices]
        
        st.write(f"Outliers detected using Z-score method: {len(df_outliers)} rows")
        return df_outliers, df[~df.index.isin(df_outliers.index)]  # Return outliers and cleaned data

    elif method == "IQR":
        # Calculate IQR for numeric columns
        numeric_cols = df.select_dtypes(include=["number"]).columns
        Q1 = df[numeric_cols].quantile(0.25)
        Q3 = df[numeric_cols].quantile(0.75)
        IQR = Q3 - Q1
        
        # Identify outliers (values outside the range [Q1 - 1.5*IQR, Q3 + 1.5*IQR])
        outliers = (df[numeric_cols] < (Q1 - 1.5 * IQR)) | (df[numeric_cols] > (Q3 + 1.5 * IQR))
        
        # Mark outliers in the dataframe
        outlier_indices = df[outliers.any(axis=1)].index
        df_outliers = df.loc[outlier_indices]
        
        st.write(f"Outliers detected using IQR method: {len(df_outliers)} rows")
        return df_outliers, df[~df.index.isin(df_outliers.index)]  # Return outliers and cleaned data

# Streamlit app for handling outliers
def HandlingOutliers():
    st.markdown("""<h1 style='color:#87CEEB;'>Outlier Detection and Handling</h1>""", unsafe_allow_html=True)
    
    st.write("Upload a dataset and detect outliers using Z-score or IQR methods.")

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

        # Choose outlier detection method
        method = st.selectbox("Select Outlier Detection Method", ["Z-score", "IQR"])

        # Handle outliers
        df_outliers, cleaned_df = handle_outliers(df, method)

        # Display outliers
        st.subheader(f"Outliers Detected Using {method}")
        st.write(df_outliers)

        # Display cleaned dataset after removing outliers
        st.subheader(f"Cleaned Dataset (Without Outliers)")
        st.write(cleaned_df)

        # Option to download the cleaned dataset
        st.download_button(
            label="Download Cleaned Dataset (No Outliers)",
            data=cleaned_df.to_csv(index=False),
            file_name="cleaned_dataset.csv",
            mime="text/csv"
        )

    else:
        st.info("Please upload a dataset to begin.")

