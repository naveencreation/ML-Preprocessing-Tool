import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from sklearn.preprocessing import LabelEncoder  
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression, Ridge, Lasso
from sklearn.svm import SVC, SVR
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.metrics import (accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score,
                             mean_squared_error, mean_absolute_error, r2_score, mean_absolute_percentage_error)
import seaborn as sns
import matplotlib.pyplot as plt

def analyze_data(df):
    
    st.markdown("""<h3 style='color:#87CEEB;'>Data Overview</h3>""", unsafe_allow_html=True)
    st.write(df.head())

    st.markdown("""<h3 style='color:#87CEEB;'>Summary Statistics</h3>""", unsafe_allow_html=True)
    st.write(df.describe(include='all'))

    st.markdown("""<h3 style='color:#87CEEB;'>Missing Values</h3>""", unsafe_allow_html=True)
    st.write(df.isnull().sum())

    st.markdown("""<h3 style='color:#87CEEB;'>Data Distribution</h3>""", unsafe_allow_html=True)
    numeric_columns = df.select_dtypes(include=['float64', 'int64']).columns
    num_cols = 2
    for i in range(0, len(numeric_columns), num_cols):
        cols = st.columns(num_cols)
        for j in range(num_cols):
            if i + j < len(numeric_columns):
                col_name = numeric_columns[i + j]
                with cols[j]:
                    st.write(f"Distribution of {col_name}")
                    fig = px.histogram(df, x=col_name, nbins=30, marginal="box", title=f"Distribution of {col_name}")
                    fig.update_layout(width=450, height=350)
                    st.plotly_chart(fig, use_container_width=True)

    st.markdown("""<h3 style='color:#87CEEB;'>Correlation Matrix</h3>""", unsafe_allow_html=True)
   
    
    corr = df.corr()
    fig = go.Figure(data=go.Heatmap(
        z=corr.values,
        x=corr.index.values,
        y=corr.columns.values,
        colorscale='Viridis',
        text=corr.values,
        texttemplate="%{text:.2f}"
    ))
    fig.update_layout(title='Correlation Matrix', width=900, height=600)
    st.plotly_chart(fig, use_container_width=True)
    return numeric_columns, df.select_dtypes(include=['object']).columns

def encode_categorical_features(df, categorical_columns):
    encoder = LabelEncoder()
    for col in categorical_columns:
        df[col] = encoder.fit_transform(df[col].astype(str))
    return df

def evaluate_classification_models(X_train, X_test, y_train, y_test):
    models = {
        'Logistic Regression': LogisticRegression(),
        'Support Vector Machine': SVC(probability=True),
        'K-Nearest Neighbors': KNeighborsClassifier(),
        'Decision Tree': DecisionTreeClassifier(),
        'Random Forest': RandomForestClassifier(),
        'Gradient Boosting': GradientBoostingClassifier()
    }
    results = []
    for model_name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted')
        recall = recall_score(y_test, y_pred, average='weighted')
        f1 = f1_score(y_test, y_pred, average='weighted')
        roc_auc = roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]) if len(set(y_test)) == 2 else None
        results.append({'Model': model_name, 'Accuracy': accuracy, 'Precision': precision, 'Recall': recall, 'F1 Score': f1, 'ROC AUC': roc_auc})
    return pd.DataFrame(results)

def evaluate_regression_models(X_train, X_test, y_train, y_test):
    models = {
        'Linear Regression': LinearRegression(),
        'Ridge Regression': Ridge(),
        'Lasso Regression': Lasso(),
        'Support Vector Machine': SVR(),
        'K-Nearest Neighbors': KNeighborsRegressor(),
        'Decision Tree': DecisionTreeRegressor(),
        'Random Forest': RandomForestRegressor(),
        'Gradient Boosting': GradientBoostingRegressor()
    }
    results = []
    for model_name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = mse ** 0.5  # Manually calculating RMSE by taking the square root of MSE
        r2 = r2_score(y_test, y_pred)
        mape = mean_absolute_percentage_error(y_test, y_pred)
        results.append({'Model': model_name, 'MSE': mse, 'MAE': mae, 'RMSE': rmse, 'R-squared': r2, 'MAPE': mape})
    return pd.DataFrame(results)

def ModelSelection():
    st.markdown("""<h1 style='color:#87CEEB;'>Automated Data Analysis & Model Selection</h1>""", unsafe_allow_html=True)
    

    # Interactive introduction
    st.markdown("""
        This tool helps you:
        1. **Analyze your dataset** 📊
        2. **Handle missing values & categorical data** 🔍
        3. **Visualize correlations & distributions** 🎨
        4. **Train and compare machine learning models** 🤖

        Simply upload your dataset, and we'll guide you through the process!  
    """)

    uploaded_file = st.file_uploader("Upload your dataset (.csv file)", type=["csv"])
    if uploaded_file is not None:
        df = pd.read_csv(uploaded_file)
        st.markdown("""<h3 style='color:#87CEEB;Dataset Preview:</h3>""", unsafe_allow_html=True)
        st.write(df.head())

        numeric_columns, categorical_columns = analyze_data(df)

        target_column = st.selectbox("Select the target column", options=df.columns)
        independent_columns = st.multiselect("Select independent feature columns", options=df.columns.tolist())

        if not independent_columns:
            st.warning("Please select at least one independent feature column.")
            return

        X = df[independent_columns]
        y = df[target_column]
        task_type = st.radio("Select Task Type:", ("Classification", "Regression"))

        if len(df) < 2:
            st.warning("Dataset is too small to split.")
            return

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        if task_type == "Classification":
            st.write("### Classification Models Evaluation")
            results = evaluate_classification_models(X_train, X_test, y_train, y_test)
            st.write(results)
        else:
            st.write("### Regression Models Evaluation")
            results = evaluate_regression_models(X_train, X_test, y_train, y_test)
            st.write(results)

