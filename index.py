import streamlit as st
from streamlit_option_menu import option_menu
from Home import Home
from ModelSelection import ModelSelection
from About import About
from EDA import EDA
from DataExploration import DataExploration
from Encoding import Encoding
from HandlingOutliers import HandlingOutliers
from FeatureScaling import FeatureScaling
from FeatureSelection import FeatureSelection
from DataBalancing import DataBalancing
from RemoveDuplicate import RemoveDuplicate
from TypeConversion import TypeConversion
from CSVPreprocessing import CSVPreprocessing


st.set_page_config(page_title="Data Processing Tool", layout="wide", menu_items={
    'Get Help': 'https://www.example.com/help',
    'Report a bug': 'https://www.example.com/bug',
    'About': "This is a Streamlit app for data preprocessing and analysis."
})

# Main pages
MAIN_PAGES = {
    "Home": Home,
    "Auto Preprocessing": CSVPreprocessing,
    "Model Selection": ModelSelection,
    "About Me": About,
    
}

# Preprocessing dropdown items
PREPROCESSING_PAGES = {
    "EDA": EDA,
    "Data Exploration": DataExploration,
    "Encoding": Encoding,
    "Handling Outliers": HandlingOutliers,
    "Feature Scaling": FeatureScaling,
    "Feature Selection": FeatureSelection,
    "Data Balancing": DataBalancing,
    "Remove Duplicates": RemoveDuplicate,
    "Type Conversion": TypeConversion,
}

if "username" not in st.session_state:
    st.session_state.username = "User"

with st.sidebar:
    # Main menu
    selected_main = option_menu(
        menu_title=f"Welcome, {st.session_state.username}",
        options=list(MAIN_PAGES.keys()) + ["Preprocessing"],
        icons=["bi bi-house", "bi bi-person-circle", "bi bi-bar-chart", "bi bi-sliders"],
        menu_icon="bi bi-tools",
        default_index=0,
    )

    # Handling Preprocessing inside the same box
    if selected_main == "Preprocessing":
        with st.container():
            selected_preprocessing = option_menu(
                menu_title="Preprocessing",
                options=list(PREPROCESSING_PAGES.keys()),
                icons=["bi bi-clipboard-data", "bi bi-search", "bi bi-code-square", "bi bi-sliders",
                       "bi bi-funnel","bi bi-funnel", "bi bi-balance-scale", "bi bi-trash", "bi bi-type"],
                menu_icon="bi bi-cpu",
                default_index=0,
            )
            page = PREPROCESSING_PAGES[selected_preprocessing]
    else:
        page = MAIN_PAGES[selected_main]

# Render the selected page
page()
