import streamlit as st
import pandas as pd

# Streamlit app for data type conversion
def TypeConversion():
    st.markdown("""<h1 style='color:#87CEEB;'>Data Type Conversion</h1>""", unsafe_allow_html=True)
    
    st.write("Upload a dataset and convert columns to appropriate data types.")

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

        # Select a column for conversion
        st.subheader("Convert Data Types")
        column = st.selectbox("Select a column to convert", df.columns)

        # Select data type to convert to
        data_type = st.selectbox("Select target data type", ["int", "float", "str", "datetime"])

        if st.button("Convert Data Type"):
            try:
                if data_type == "int":
                    df[column] = df[column].astype(int)
                elif data_type == "float":
                    df[column] = df[column].astype(float)
                elif data_type == "str":
                    df[column] = df[column].astype(str)
                elif data_type == "datetime":
                    df[column] = pd.to_datetime(df[column], errors="coerce")

                st.success(f"Column '{column}' successfully converted to {data_type}.")
                st.write("Updated Dataset")
                st.write(df)

                # Download the updated dataset
                st.download_button(
                    label="Download Updated Dataset",
                    data=df.to_csv(index=False),
                    file_name="updated_dataset.csv",
                    mime="text/csv"
                )
            except Exception as e:
                st.error(f"Error in conversion: {e}")

    else:
        st.info("Please upload a dataset to begin.")
