import streamlit as st
import pandas as pd
import io  # Import StringIO for capturing df.info() output

# Streamlit app
def DataExploration():
    st.markdown("""<h1 style='color:#87CEEB;'>Data Exploration </h1>""", unsafe_allow_html=True)
    
    st.write("Upload a dataset and explore its basic properties.")

    # File uploader
    uploaded_file = st.file_uploader("Upload your CSV or Excel file", type=["csv", "xlsx"])

    if uploaded_file:
        # Check file type and read accordingly
        if uploaded_file.name.endswith('.csv'):
            df = pd.read_csv(uploaded_file)
        elif uploaded_file.name.endswith('.xlsx'):
            df = pd.read_excel(uploaded_file)
        else:
            st.error("Unsupported file type")
            return

        # Display dataset info
        st.subheader("Dataset Overview")
        st.write("### First Few Rows")
        st.dataframe(df.head())

        st.write("### Data Types and Missing Values")
        # Capture df.info() output
        buffer = io.StringIO()
        df.info(buf=buffer)
        st.text(buffer.getvalue())  # Display the captured output

        st.write("### Summary Statistics")
        st.dataframe(df.describe(include="all"))

        # Additional exploration
        st.write("### Missing Values")
        st.dataframe(df.isnull().sum())

        st.write("### Dataset Shape")
        st.write(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")

        st.write("### Column Names")
        st.write(df.columns.tolist())

    else:
        st.info("Please upload a file to begin.")

