import streamlit as st
import pandas as pd
from sklearn.preprocessing import MinMaxScaler, StandardScaler, RobustScaler

# Streamlit app for feature scaling/normalization
def FeatureScaling():
    st.markdown("""<h1 style='color:#87CEEB;'>Feature Scaling and Normalization(EDA)</h1>""", unsafe_allow_html=True)
    
    
    st.write("Upload a dataset and scale/normalize numerical features using various methods.")

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

        # Select numerical columns
        st.subheader("Select Numerical Columns for Scaling")
        numerical_columns = df.select_dtypes(include=["int64", "float64"]).columns
        if len(numerical_columns) == 0:
            st.warning("No numerical columns found in the dataset.")
            return

        selected_columns = st.multiselect("Select one or more columns to scale", numerical_columns)

        if selected_columns:
            # Select scaling method
            st.subheader("Select Scaling Method")
            scaling_method = st.radio(
                "Choose a scaling/normalization method",
                ["Min-Max Scaling (0 to 1)", "Standardization (zero mean, unit variance)", "Robust Scaling (handles outliers)"]
            )

            if st.button("Apply Scaling"):
                scaler = None
                if scaling_method == "Min-Max Scaling (0 to 1)":
                    scaler = MinMaxScaler()
                elif scaling_method == "Standardization (zero mean, unit variance)":
                    scaler = StandardScaler()
                elif scaling_method == "Robust Scaling (handles outliers)":
                    scaler = RobustScaler()

                # Apply the selected scaler to the selected columns
                try:
                    df[selected_columns] = scaler.fit_transform(df[selected_columns])
                    st.success(f"Scaling applied successfully using {scaling_method}.")
                    
                    # Display the updated dataset
                    st.subheader("Scaled Dataset")
                    st.write(df)

                    # Download the updated dataset
                    st.download_button(
                        label="Download Scaled Dataset",
                        data=df.to_csv(index=False),
                        file_name="scaled_dataset.csv",
                        mime="text/csv"
                    )
                except Exception as e:
                    st.error(f"Error applying scaling: {e}")
        else:
            st.info("Please select at least one column to scale.")
    else:
        st.info("Please upload a dataset to begin.")

