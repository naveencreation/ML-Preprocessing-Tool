import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Streamlit app for Exploratory Data Analysis (EDA)
def EDA():
    st.markdown("""<h1 style='color:#87CEEB;'>Exploratory Data Analysis (EDA)</h1>""", unsafe_allow_html=True)
    
    st.write("Upload a CSV file to start exploring the data.")

    # File uploader
    uploaded_file = st.file_uploader("Upload your CSV file", type="csv")

    if uploaded_file:
        # Load dataset
        df = pd.read_csv(uploaded_file)

        st.subheader("Dataset Overview")
        # Display the dataset
        st.write(df)

        # Show basic information about the dataset
        st.subheader("Basic Information")
        buffer = st.empty()  # Create an empty placeholder for info
        with buffer:
            st.write(df.info())  # Display data types and missing values

        # Show summary statistics
        st.subheader("Summary Statistics")
        st.write(df.describe())

        # Data visualization options
        st.subheader("Data Visualizations")
        visualization_option = st.selectbox("Select Visualization", ["None", "Interactive Histogram", "Interactive Boxplot", "Interactive Correlation Matrix"])

        # Handle visualizations
        if visualization_option == "Interactive Histogram":
            selected_column = st.selectbox("Select column for Histogram", df.select_dtypes(include=['number']).columns)
            st.write(f"Interactive Histogram for {selected_column}")
            fig = px.histogram(df, x=selected_column, nbins=30, title=f'Interactive Histogram for {selected_column}')
            st.plotly_chart(fig)

        elif visualization_option == "Interactive Boxplot":
            selected_column = st.selectbox("Select column for Boxplot", df.select_dtypes(include=['number']).columns)
            st.write(f"Interactive Boxplot for {selected_column}")
            fig = px.box(df, y=selected_column, title=f'Interactive Boxplot for {selected_column}')
            st.plotly_chart(fig)

        elif visualization_option == "Interactive Correlation Matrix":
            st.write("Interactive Correlation matrix of numerical columns.")
            correlation_matrix = df.corr()
            fig = px.imshow(correlation_matrix, title="Interactive Correlation Matrix", color_continuous_scale="RdBu", aspect="auto")
            st.plotly_chart(fig)

        # Show missing values
        st.subheader("Missing Values")
        missing_values = df.isnull().sum()
        st.write(missing_values[missing_values > 0])

        # Show unique values for categorical columns
        st.subheader("Unique Values in Categorical Columns")
        categorical_columns = df.select_dtypes(include=['object']).columns
        for column in categorical_columns:
            st.write(f"Unique values in {column}: {df[column].nunique()} unique values")
            st.write(df[column].unique())

if __name__ == "__main__":
    main()
