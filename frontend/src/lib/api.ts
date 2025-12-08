import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const uploadDataset = async (file: File, datasetType?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (datasetType) {
        formData.append('dataset_type', datasetType);
    }
    const response = await api.post('/datasets/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getDatasets = async () => {
    const response = await api.get('/datasets/');
    return response.data;
};

export const getDataset = async (id: number) => {
    const response = await api.get(`/datasets/${id}`);
    return response.data;
};

export const getDatasetPreview = async (id: number) => {
    const response = await api.get(`/datasets/${id}/preview`);
    return response.data;
};

export interface PreprocessingOptions {
    missing_option: string
    encoding_method: string
    scaling_method: string
    outlier_method?: string
    feature_engineering_method?: string
    columns?: string[]

    // Data Cleaning
    remove_duplicates?: boolean
    fix_numeric_formats?: boolean
    fix_date_formats?: boolean
    standardize_text?: boolean

    // Feature Engineering
    target_encoding?: boolean
    frequency_encoding?: boolean
    date_feature_extraction?: boolean
    text_feature_extraction?: boolean
    rare_category_handling?: boolean

    // Target Processing
    target_column?: string
    smote_oversampling?: boolean

    // Feature Selection
    remove_high_correlation?: boolean
    low_variance_filtering?: boolean

    // Split
    train_test_split?: boolean
    test_size?: number
    stratify?: boolean

    // Text Processing
    text_cleaning_method?: string
    stopword_removal?: boolean
    stemming?: boolean
    lemmatization?: boolean
    vectorization_method?: string

    // Image Processing
    image_resize?: boolean
    image_width?: number
    image_height?: number
    image_grayscale?: boolean
    image_augmentation?: boolean

    // Audio Processing
    audio_trim_silence?: boolean
    audio_resample?: boolean
    audio_sample_rate?: number
    audio_feature_extraction?: string

    // Log Processing
    log_parse_timestamp?: boolean
    log_extract_levels?: boolean
    log_pattern_extraction?: string

    // Time Series Processing
    ts_resample?: boolean
    ts_resample_freq?: string
    ts_lag_features?: boolean
    ts_rolling_window?: boolean
}


export const applyPreprocessing = async (id: number, options: PreprocessingOptions) => {
    const response = await api.post(`/preprocessing/${id}/apply`, options);
    return response.data;
};

export const generatePreprocessingCode = async (id: number, options: PreprocessingOptions, format: string = "simple") => {
    const response = await api.post(`/preprocessing/${id}/generate-code`, options, {
        params: { format }
    });
    return response.data;
};

export const exportNotebook = async (id: number, options: PreprocessingOptions) => {
    const response = await api.post(`/preprocessing/${id}/export-notebook`, options, {
        responseType: 'blob'
    });
    return response.data;
};

export const getDatasetComparison = async (id: number) => {
    const response = await api.get(`/preprocessing/${id}/comparison`);
    return response.data;
};

export const getEDAStats = async (id: number) => {
    const response = await api.get(`/eda/${id}/stats`);
    return response.data;
};

export const getSmartInsights = async (id: number) => {
    const response = await api.get(`/eda/${id}/insights`);
    return response.data;
};

export const getHistogram = async (id: number, column: string) => {
    const response = await api.get(`/eda/${id}/histogram`, { params: { column } });
    return response.data;
};

export const getBoxplot = async (id: number, column: string) => {
    const response = await api.get(`/eda/${id}/boxplot`, { params: { column } });
    return response.data;
};

export const getCorrelation = async (id: number) => {
    const response = await api.get(`/eda/${id}/correlation`);
    return response.data;
};

export const deleteDataset = async (id: number) => {
    const response = await api.delete(`/datasets/${id}`);
    return response.data;
};

export const updateDataset = async (id: number, data: { filename: string }) => {
    const response = await api.put(`/datasets/${id}`, data);
    return response.data;
};

export const downloadDataset = (id: number) => {
    // Direct download link
    window.location.href = `${API_URL}/datasets/${id}/download`;
};

export interface WorkflowTemplate {
    id: number
    name: string
    description?: string
    config: PreprocessingOptions
    created_at: string
}

export const createTemplate = async (data: { name: string, description?: string, config: PreprocessingOptions }) => {
    const response = await api.post('/workflows/', data);
    return response.data;
};

export const getTemplates = async () => {
    const response = await api.get('/workflows/');
    return response.data;
};

export const deleteTemplate = async (id: number) => {
    const response = await api.delete(`/workflows/${id}`);
    return response.data;
};

export const getAllLogs = async () => {
    const response = await api.get('/preprocessing/logs/all');
    return response.data;
};

export const getDatasetLogs = async (id: number) => {
    const response = await api.get(`/preprocessing/${id}/logs`);
    return response.data;
};
export interface TrainingOptions {
    target_column: string
    model_type: string
    test_size?: number
    hyperparameters?: Record<string, any>
    cross_validation?: boolean
    cv_folds?: number
}

export interface TrainingResult {
    status: string
    model_type: string
    model_path: string
    metrics: Record<string, number>
}

export const trainModel = async (datasetId: number, options: TrainingOptions) => {
    const response = await api.post(`/training/${datasetId}/train`, options);
    return response.data as TrainingResult;
};

export const getTrainedModels = async (datasetId: number) => {
    const response = await api.get(`/training/${datasetId}/models`);
    return response.data;
};

export interface InferenceResult {
    predictions: any[]
    probabilities?: any[]
}

export const predict = async (modelId: string, data: any[]) => {
    // Note: The backend inference endpoint might need adjustment to take model_path or ID
    // Currently backend expects model_path in the body?
    // Let's check backend/app/routers/inference.py
    // It takes InferenceRequest with model_path and data.
    const response = await api.post('/inference/predict', { model_path: modelId, data });
    return response.data as InferenceResult;
};

export const getModelInfo = async (datasetId: number) => {
    const response = await api.get(`/inference/${datasetId}/info`);
    return response.data;
};
