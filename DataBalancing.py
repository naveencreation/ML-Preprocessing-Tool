import streamlit as st
import pandas as pd
from imblearn.over_sampling import SMOTE
from imblearn.under_sampling import RandomUnderSampler
from sklearn.model_selection import train_test_split
from collections import Counter

# Streamlit app for data balancing
def DataBalancing():
    st.markdown("""<h1 style='color:#87CEEB;'>Data Balancing</h1>""", unsafe_allow_html=True)
    
    st.write("Upload a dataset and balance it using SMOTE (oversampling) or Random Undersampling.")

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

        # Select target variable (dependent variable)
        st.subheader("Select Target Variable")
        target_column = st.selectbox("Select the target variable (dependent variable)", df.columns)

        # Splitting data into features (X) and target (y)
        X = df.drop(columns=[target_column])
        y = df[target_column]

        # Check the class distribution
        st.write(f"Original class distribution:\n{y.value_counts()}")

        # Choose balancing method
        method = st.selectbox("Select Balancing Method", ["SMOTE (Oversampling)", "Random Undersampling"])

        # Split the data into training and testing
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

        # Initialize variables for resampled data
        X_train_res, y_train_res = X_train, y_train  # Default to original if no resampling is applied

        if method == "SMOTE (Oversampling)":
            # Check if the dataset has enough samples for SMOTE
            if y_train.value_counts().min() < 6:
                st.error("The minority class does not have enough samples for SMOTE. Consider reducing n_neighbors or using a larger dataset.")
            else:
                # Apply SMOTE to balance the classes
                smote = SMOTE(sampling_strategy='auto', random_state=42, k_neighbors=3)  # Reduce n_neighbors to 3
                X_train_res, y_train_res = smote.fit_resample(X_train, y_train)

                # Show the results
                st.write("After SMOTE (Oversampling), the class distribution is:")
                st.write(pd.Series(y_train_res).value_counts())
                
                # Display the balanced dataset sample
                st.subheader("Balanced Dataset (Sample)")
                st.write(pd.DataFrame(X_train_res).head())

        elif method == "Random Undersampling":
            # Apply Random Undersampling to balance the classes
            undersample = RandomUnderSampler(sampling_strategy='auto', random_state=42)
            X_train_res, y_train_res = undersample.fit_resample(X_train, y_train)

            # Show the results
            st.write("After Random Undersampling, the class distribution is:")
            st.write(pd.Series(y_train_res).value_counts())

            # Display the balanced dataset sample
            st.subheader("Balanced Dataset (Sample)")
            st.write(pd.DataFrame(X_train_res).head())

        # Option to download the balanced dataset
        st.download_button(
            label="Download Balanced Dataset",
            data=pd.DataFrame(X_train_res).to_csv(index=False),
            file_name="balanced_dataset.csv",
            mime="text/csv"
        )

    else:
        st.info("Please upload a dataset to begin.")


