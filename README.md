# ML Preprocessing Tool

An advanced, interactive web application for automated machine learning data preprocessing, exploratory data analysis (EDA), and pipeline generation. Built for data scientists to streamline the transition from raw data to model-ready datasets.

![Dashboard Preview](https://placehold.co/1200x600/2563eb/ffffff?text=ML+Preprocessing+Tool)

## 🚀 Key Features

### 📊 Interactive EDA
- **Smart Insights**: Automatic detection of data quality issues (skewness, outliers, missing values).
- **Visual Analysis**: Interactive distribution plots, correlation matrices, and box plots.
- **Statistical Summary**: Detailed descriptive statistics for all features.

### 🛠️ Visual Preprocessing Pipeline
Configure your pipeline step-by-step with a drag-and-drop style interface:
1.  **Data Cleaning**: Remove duplicates, fix data types, standardize text.
2.  **Missing Values**: Imputation strategies (Mean, Median, Mode, Forward Fill).
3.  **Outlier Handling**: Z-Score, IQR, or Capping methods.
4.  **Encoding**: One-Hot, Label Encoding, and Rare Category handling.
5.  **Scaling**: StandardScaler, MinMaxScaler, RobustScaler.
6.  **Feature Selection**: Remove high correlation, low variance filtering.
7.  **Feature Engineering**: Date extraction, text length extraction.
8.  **Train/Test Split**: Stratified splitting and SMOTE oversampling.

### ⚡ Real-time Code Generation
- Instantly see the equivalent Python/Pandas code for your configured pipeline.
- **Jupyter Notebook Export**: Download a fully executable `.ipynb` file with your complete pipeline and EDA.

### 📂 Dataset Management
- Upload CSV/Excel files.
- Track processing history and logs.
- Save and reuse pipeline templates.

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn UI
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Data Processing**: Pandas, NumPy, Scikit-learn
- **Database**: SQLite (SQLAlchemy)
- **Validation**: Pydantic

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 📝 Usage Workflow
1. **Upload**: Go to the "Datasets" page and upload your raw CSV file.
2. **Explore**: Click on the dataset to view the Dashboard and understand your data distributions.
3. **Process**: Click "Start Preprocessing" to enter the pipeline configurator.
4. **Configure**: Toggle steps (Cleaning, Missing, etc.) and adjust parameters. Watch the "Live Preview" to see how your data changes in real-time.
5. **Export**: Click "Download Notebook" to get the Python code, or "Run Pipeline" to process the file on the server.

## 📄 License
MIT License
