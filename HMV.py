import streamlit as st
import pandas as pd

# Streamlit app for handling missing values
def handling_missing_values():
    st.markdown("""<h1 style='color:#87CEEB;'>Missing Values Handler</h1>""", unsafe_allow_html=True)
    
    st.write("Upload a dataset and handle missing values with various strategies.")

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
        
        # Display missing values summary
        st.write("### Missing Values Summary")
        st.write(df.isnull().sum())

        # Dropdown for handling missing values
        st.subheader("Choose a Strategy to Handle Missing Values")
        strategy = st.selectbox(
            "Select a strategy",
            ["Drop Missing Rows", "Drop Missing Columns", "Fill with Mean", "Fill with Median", "Fill with Mode", "Interpolate"]
        )

        # Process based on selected strategy
        if strategy == "Drop Missing Rows":
            df_cleaned = df.dropna()
            st.write("Rows with missing values dropped.")
        elif strategy == "Drop Missing Columns":
            df_cleaned = df.dropna(axis=1)
            st.write("Columns with missing values dropped.")
        elif strategy == "Fill with Mean":
            df_cleaned = df.fillna(df.mean(numeric_only=True))
            st.write("Missing values filled with column mean.")
        elif strategy == "Fill with Median":
            df_cleaned = df.fillna(df.median(numeric_only=True))
            st.write("Missing values filled with column median.")
        elif strategy == "Fill with Mode":
            df_cleaned = df.fillna(df.mode().iloc[0])
            st.write("Missing values filled with column mode.")
        elif strategy == "Interpolate":
            df_cleaned = df.interpolate()
            st.write("Missing values estimated using interpolation.")

        # Display cleaned dataset
        st.subheader("Cleaned Dataset")
        st.write(df_cleaned)

        # Option to download the cleaned dataset
        st.download_button(
            label="Download Cleaned Dataset",
            data=df_cleaned.to_csv(index=False),
            file_name="cleaned_dataset.csv",
            mime="text/csv"
        )

    else:
        st.info("Please upload a dataset to begin.")

if __name__ == "__main__":
    main()
