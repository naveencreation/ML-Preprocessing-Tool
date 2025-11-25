import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const uploadDataset = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/datasets/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data', // This will be auto-set by browser with boundary
        },
    });
    return response.data;
};

export const getDatasets = async () => {
    const response = await api.get('/datasets/');
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

export const getDatasetComparison = async (id: number) => {
    const response = await api.get(`/preprocessing/${id}/comparison`);
    return response.data;
};

export const getEDAStats = async (id: number) => {
    const response = await api.get(`/eda/${id}/stats`);
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
