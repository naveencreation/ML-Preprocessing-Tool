/**
 * Shared TypeScript types for the application
 * Provides strong typing for API responses and data models
 */

// ============ Dataset Types ============
export interface Dataset {
    id: number
    filename: string
    filepath: string
    upload_date: string
    size_bytes: number
    row_count: number
    column_count: number
    status: string
    dataset_type: string
    parent_dataset_id?: number | null
    processing_logs: ProcessingLog[]
}

export interface DatasetPreview {
    id: number
    filename: string
    columns: string[]
    column_types: Record<string, string>
    preview: Record<string, any>[]
    total_rows: number
    missing_values: Record<string, number>
    dataset_type: string
}

// ============ Processing Types ============
export interface ProcessingLog {
    id: number
    dataset_id: number
    action: string
    parameters: Record<string, any> | null
    created_at: string
}

export interface ProcessingResult {
    id: number
    status: string
    new_row_count: number
    new_column_count: number
    message?: string
}

// ============ EDA Types ============
export interface EDAStats {
    total_rows: number
    total_columns: number
    missing_values: Record<string, number>
    missing_percentages: Record<string, number>
    duplicates: number
    numeric_columns: string[]
    categorical_columns: string[]
    column_stats: Record<string, ColumnStats>
}

export interface ColumnStats {
    type: string
    unique: number
    missing: number
    missing_pct: number
    mean?: number
    std?: number
    min?: number
    max?: number
    top?: string
    freq?: number
}

export interface SmartInsight {
    type: 'warning' | 'info' | 'suggestion'
    title: string
    description: string
    severity?: 'low' | 'medium' | 'high'
}

// ============ Comparison Types ============
export interface ComparisonData {
    before: DatasetStats
    after: DatasetStats
    changes: string[]
    operations_applied: string[]
}

export interface DatasetStats {
    totalRows: number
    totalColumns: number
    missingByColumn?: Record<string, number>
    outliers?: number
    duplicates?: number
}

// ============ Training Types ============
export interface TrainingResult {
    status: string
    model_type: string
    model_path: string
    metrics: Record<string, number>
}

export interface ModelInfo {
    model_path: string
    model_type: string
    target_column: string
    feature_columns: string[]
    metrics: Record<string, number>
    created_at: string
}

// ============ Inference Types ============
export interface InferenceResult {
    predictions: any[]
    probabilities?: any[]
}

// ============ Workflow Types ============
export interface WorkflowTemplate {
    id: number
    name: string
    description?: string
    config: Record<string, any>
    created_at: string
}
