# ML Preprocessing Tool

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An advanced, interactive web application for automated machine learning data preprocessing, exploratory data analysis (EDA), and pipeline generation. Built for data scientists to streamline the transition from raw data to model-ready datasets.

## ✨ Features

### 📊 Interactive EDA
- **Smart Insights**: Automatic detection of data quality issues (skewness, outliers, missing values)
- **Visual Analysis**: Interactive distribution plots, correlation matrices, and box plots
- **Statistical Summary**: Detailed descriptive statistics for all features

### 🛠️ Visual Preprocessing Pipeline
Configure your preprocessing step-by-step:
- **Data Cleaning**: Remove duplicates, fix data types
- **Missing Values**: Mean, Median, Mode, Forward Fill imputation
- **Outlier Handling**: Z-Score, IQR, or Capping methods
- **Encoding**: One-Hot, Label Encoding, Rare Category handling
- **Scaling**: StandardScaler, MinMaxScaler, RobustScaler
- **Feature Selection**: Remove high correlation, low variance
- **Train/Test Split**: Stratified splitting with SMOTE oversampling

### ⚡ Code Generation
- **Real-time Python code** for your configured pipeline
- **Jupyter Notebook Export**: Download executable `.ipynb` files

### 🎨 Supported Data Types
| Type | Extensions | Status |
|------|-----------|--------|
| Tabular | `.csv`, `.xlsx`, `.json` | ✅ |
| Text | `.txt`, `.csv` | ✅ |
| Image | `.jpg`, `.png`, `.tiff` | ✅ |
| Audio | `.wav`, `.mp3`, `.flac` | ✅ |
| Video | `.mp4`, `.avi`, `.mov` | 🔜 Coming Soon |
| Logs | `.log`, `.txt` | ✅ |

## 🏗️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI |
| **Backend** | FastAPI, Pandas, NumPy, Scikit-learn |
| **Database** | SQLite (SQLAlchemy ORM) |
| **Charts** | Recharts, Plotly.js |

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Python 3.10+

### 1. Clone & Setup Backend
```bash
git clone https://github.com/your-username/ML-Preprocessing-Tool.git
cd ML-Preprocessing-Tool/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload
```
Backend runs at: http://localhost:8000

### 2. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

## 📖 API Documentation

Once the backend is running, access the interactive API docs:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📁 Project Structure

```
ML-Preprocessing-Tool/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app entry
│   │   ├── routers/          # API endpoints
│   │   ├── services/         # Business logic
│   │   ├── models.py         # SQLAlchemy models
│   │   └── utils/            # Helpers (logging)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Route pages
    │   ├── lib/              # Utilities & types
    │   └── App.tsx           # Route configuration
    └── package.json
```

## 📝 Usage Workflow

1. **Upload**: Go to "Upload" and select your data type
2. **Explore**: View the Dashboard to understand data distributions
3. **Process**: Enter the pipeline configurator
4. **Configure**: Toggle steps and adjust parameters
5. **Export**: Download notebook or run the pipeline

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/.env`):
```env
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=104857600  # 100MB
CORS_ORIGINS=["http://localhost:5173"]
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
