import streamlit as st
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler

def Preprocessing(df, missing_option, encoding_method, scaling_method):
    """Function to preprocess the uploaded CSV file"""

    if df.empty:
        st.error("The uploaded CSV file is empty. Please upload a valid file.")
        return None

    # Handle Missing Values
    try:
        if missing_option == "Drop Rows":
            df.dropna(inplace=True)
        elif missing_option == "Fill with Mean":
            df.fillna(df.mean(), inplace=True)
        elif missing_option == "Fill with Median":
            df.fillna(df.median(), inplace=True)
        elif missing_option == "Fill with Mode":
            df.fillna(df.mode().iloc[0], inplace=True)
    except Exception as e:
        st.error(f"Error handling missing values: {e}")
        return None

    # Encoding Categorical Variables
    categorical_columns = df.select_dtypes(include=['object']).columns.tolist()
    if categorical_columns:
        try:
            if encoding_method == "Label Encoding":
                for col in categorical_columns:
                    df[col] = LabelEncoder().fit_transform(df[col])
            elif encoding_method == "One-Hot Encoding":
                df = pd.get_dummies(df, columns=categorical_columns)
        except Exception as e:
            st.error(f"Encoding error: {e}")
            return None

    # Scaling Numerical Features
    numerical_columns = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
    if numerical_columns:
        try:
            if scaling_method == "StandardScaler":
                df[numerical_columns] = StandardScaler().fit_transform(df[numerical_columns])
            elif scaling_method == "MinMaxScaler":
                df[numerical_columns] = MinMaxScaler().fit_transform(df[numerical_columns])
        except Exception as e:
            st.error(f"Scaling error: {e}")
            return None

    return df

def CSVPreprocessing():
    st.markdown("""<h1 style='color:#87CEEB;'>🚀 Automated Preprocessing </h1>""", unsafe_allow_html=True)
    
    st.markdown("""
    Just **upload your CSV file**, and we’ll automatically clean, encode, and scale your data based on your selections.  
    - Get a **preprocessed file instantly** tailored to your needs.  
    - Want more control? **Click preprocessing** with various options!  
""")


    uploaded_file = st.file_uploader("Upload a CSV file", type=["csv"])

    if uploaded_file is not None:
        try:
            df = pd.read_csv(uploaded_file)
            st.markdown("""<h2 style='color:#87CEEB;'>Preview of Uploaded Data </h2>""", unsafe_allow_html=True)
    
            st.write(df.head())

            missing_option = st.selectbox("Choose a method to handle missing values:", 
                                          ["Drop Rows", "Fill with Mean", "Fill with Median", "Fill with Mode"], index=1)

            encoding_method = st.selectbox("Choose encoding method:", ["Label Encoding", "One-Hot Encoding"])
            scaling_method = st.selectbox("Choose a scaling method:", ["StandardScaler", "MinMaxScaler"])

            processed_df = Preprocessing(df, missing_option, encoding_method, scaling_method)

            if processed_df is not None:
                st.write("### Data After Preprocessing:")
                st.write(processed_df.head())

                @st.cache_data
                def convert_df_to_csv(df):
                    return df.to_csv(index=False).encode('utf-8')

                processed_csv = convert_df_to_csv(processed_df)
                st.download_button(label="Download Processed CSV", data=processed_csv, file_name="processed_data.csv", mime="text/csv")

        except Exception as e:
            st.error(f"An error occurred: {e}")
