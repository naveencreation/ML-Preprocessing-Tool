import streamlit as st
import pandas as pd

# Streamlit app for handling duplicates
def RemoveDuplicate():
    st.markdown("""<h1 style='color:#87CEEB;'>Duplicate Rows Handler</h1>""", unsafe_allow_html=True)
    
    st.write("Upload a dataset to identify and remove duplicate rows.")

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

        # Check for duplicate rows
        st.write("### Duplicate Rows Summary")
        duplicate_count = df.duplicated().sum()
        st.write(f"Number of duplicate rows: {duplicate_count}")

        if duplicate_count > 0:
            # Display duplicate rows
            st.write("### Duplicate Rows")
            st.write(df[df.duplicated()])

            # Option to remove duplicates
            if st.button("Remove Duplicate Rows"):
                df_cleaned = df.drop_duplicates()
                st.success(f"Duplicate rows removed. Cleaned dataset has {df_cleaned.shape[0]} rows.")

                # Display cleaned dataset
                st.subheader("Cleaned Dataset")
                st.write(df_cleaned)

                # Download button for cleaned dataset
                st.download_button(
                    label="Download Cleaned Dataset",
                    data=df_cleaned.to_csv(index=False),
                    file_name="cleaned_dataset.csv",
                    mime="text/csv"
                )
        else:
            st.success("No duplicate rows found in the dataset.")

    else:
        st.info("Please upload a dataset to begin.")

