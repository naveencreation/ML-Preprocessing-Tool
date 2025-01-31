import streamlit as st
import pandas as pd
from sklearn.preprocessing import LabelEncoder

# Streamlit app for handling multiple categorical columns
def Encoding():
    st.markdown("""<h1 style='color:#87CEEB;'>Categorical Variable Encoding (EDA)</h1>""", unsafe_allow_html=True)
    
    st.write("Upload a dataset and encode multiple categorical variables into numerical format.")

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

        # Select categorical columns
        st.subheader("Select Categorical Columns")
        categorical_columns = df.select_dtypes(include=["object", "category"]).columns
        if len(categorical_columns) == 0:
            st.warning("No categorical columns found in the dataset.")
            return

        selected_columns = st.multiselect("Select one or more columns to encode", categorical_columns)

        if selected_columns:
            # Encoding method selection
            encoding_method = st.radio(
                "Select Encoding Method",
                ["Label Encoding", "One-Hot Encoding"]
            )

            if st.button("Apply Encoding"):
                if encoding_method == "Label Encoding":
                    # Apply Label Encoding
                    le = LabelEncoder()
                    for column in selected_columns:
                        df[column] = le.fit_transform(df[column])
                    st.success(f"Selected columns encoded using Label Encoding.")

                elif encoding_method == "One-Hot Encoding":
                    # Apply One-Hot Encoding
                    df = pd.get_dummies(df, columns=selected_columns, drop_first=True)
                    st.success(f"Selected columns encoded using One-Hot Encoding.")

                # Display updated dataset
                st.subheader("Updated Dataset")
                st.write(df)

                # Download the updated dataset
                st.download_button(
                    label="Download Updated Dataset",
                    data=df.to_csv(index=False),
                    file_name="encoded_dataset.csv",
                    mime="text/csv"
                )
        else:
            st.info("Please select at least one column to encode.")
    else:
        st.info("Please upload a dataset to begin.")

