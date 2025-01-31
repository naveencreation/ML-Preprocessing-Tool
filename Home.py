import streamlit as st
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

def Home():
    # Introduction
    st.markdown("""<h1 style='color:#87CEEB;'>Preprocessing for Machine Learning</h1>""", unsafe_allow_html=True)
    st.markdown("<h1 style='text-align: center;'>Hello , I am <span style='color:#8a4af3;'>Naveen</span> 👋</h1>", unsafe_allow_html=True)
    st.write("""
    Today we're going to explore the importance of data preprocessing in machine learning.
    
    Data preprocessing is a crucial step in any machine learning pipeline. Raw data often contains inconsistencies such as 
    missing values, duplicates, and outliers. If we don’t clean and prepare the data properly, our models might give 
    inaccurate predictions.
    
    In this tutorial, we'll go step by step through the preprocessing techniques used to prepare data for machine learning models.
    """)
    
    # 1. Data Loading
    st.markdown("""<h2 style='color:#87CEEB;'>1. Data Loading</h2>""", unsafe_allow_html=True)
    st.write("""
    The first step in preprocessing is loading the data. We commonly use Pandas to read datasets from CSV files.
    """)
    st.code("df = pd.read_csv('file.csv')", language='python')
    st.write("This command reads a CSV file and converts it into a DataFrame for further processing.")
    
    # 2. Data Exploration
    st.markdown("""<h2 style='color:#87CEEB;'>2. Data Exploration</h2>""", unsafe_allow_html=True)
    st.write("""
    Before preprocessing, we need to understand the structure of the dataset. These commands help in exploring data:
    """)
    st.code("""
    df.head()  # Shows the first few rows
    df.info()  # Displays column data types and missing values
    df.describe()  # Provides statistical summary
    """, language='python')
    st.write("This helps us decide how to clean and preprocess our data.")
    
    # 3. Handling Missing Values
    st.markdown("""<h2 style='color:#87CEEB;'>3. Handling Missing Values</h2>""", unsafe_allow_html=True)
    st.write("""
    Missing values can lead to inaccurate models. Common ways to handle them are:
    - Removing rows with missing values
    - Imputing missing values with mean, median, or mode
    """)
    st.code("""
    df.dropna()  # Removes missing values
    df.fillna(df.mean())  # Fills missing values with mean
    """, language='python')
    st.write("Dropping data may result in loss of information, so imputation is usually preferred.")
    
    # 4. Handling Duplicates
    st.markdown("""<h2 style='color:#87CEEB;'>4. Handling Duplicates</h2>""", unsafe_allow_html=True)
    st.write("""
    Duplicate data can bias the model. We can remove them using:
    """)
    st.code("df.drop_duplicates()", language='python')
    st.write("This ensures unique and clean data for training.")
    
    # 5. Data Type Conversion
    st.markdown("""<h2 style='color:#87CEEB;'>5. Data Type Conversion</h2>""", unsafe_allow_html=True)
    st.write("""
    Data types must be appropriate for processing. For example, converting a numerical column from string to float:
    """)
    st.code("df['column'] = df['column'].astype(float)", language='python')
    
    # 6. Handling Categorical Variables
    st.markdown("""<h2 style='color:#87CEEB;'>6. Handling Categorical Variables</h2>""", unsafe_allow_html=True)
    st.write("""
    Machine learning models work with numbers, so categorical values need to be converted into numerical format:
    - Label Encoding: Assigns numbers to categories
    - One-Hot Encoding: Creates separate binary columns
    """)
    st.code("""
    from sklearn.preprocessing import LabelEncoder
    le = LabelEncoder()
    df['category'] = le.fit_transform(df['category'])
    pd.get_dummies(df['category'])  # One-hot encoding
    """, language='python')
    
    # 7. Feature Scaling/Normalization
    st.markdown("""<h2 style='color:#87CEEB;'>7. Feature Scaling/Normalization</h2>""", unsafe_allow_html=True)
    st.write("""
    Scaling ensures that numerical features contribute equally to the model.
    - Min-Max Scaling scales values between 0 and 1
    - Standardization adjusts data to zero mean and unit variance
    """)
    st.code("""
    from sklearn.preprocessing import MinMaxScaler, StandardScaler
    scaler = MinMaxScaler()
    df_scaled = scaler.fit_transform(df[['column']])
    """, language='python')
    
    # More sections...
    
    # Conclusion
    st.markdown("""<h2 style='color:#87CEEB;'>Conclusion</h2>""", unsafe_allow_html=True)
    st.write("""
    These preprocessing steps are essential for building accurate machine learning models. Properly cleaned and prepared data
    leads to better predictions and generalization.
    """)
