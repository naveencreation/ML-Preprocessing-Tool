// Configuration template management
export interface PreprocessingTemplate {
    id: string
    name: string
    description: string
    dataType: 'dataset' | 'text' | 'image' | 'audio' | 'logs'
    steps: {
        stepId: string
        enabled: boolean
        parameters: Record<string, any>
    }[]
    createdAt: string
}

const TEMPLATES_KEY = 'preprocessing_templates'
const DEFAULT_TEMPLATES_KEY = 'default_templates_loaded'

// Default templates
const defaultTemplates: PreprocessingTemplate[] = [
    {
        id: 'dataset-quick-clean',
        name: 'Quick Clean',
        description: 'Minimal preprocessing for quick exploration',
        dataType: 'dataset',
        steps: [
            { stepId: 'missing_values', enabled: true, parameters: { strategy: 'Fill with Mean' } },
            { stepId: 'encoding', enabled: false, parameters: {} },
            { stepId: 'scaling', enabled: false, parameters: {} },
            { stepId: 'outliers', enabled: false, parameters: {} },
            { stepId: 'feature_selection', enabled: false, parameters: {} },
            { stepId: 'train_test_split', enabled: true, parameters: { test_size: 0.2, stratify: false } },
        ],
        createdAt: new Date().toISOString()
    },
    {
        id: 'dataset-full-pipeline',
        name: 'Full Pipeline',
        description: 'Complete preprocessing for production-ready data',
        dataType: 'dataset',
        steps: [
            { stepId: 'missing_values', enabled: true, parameters: { strategy: 'Fill with Mean' } },
            { stepId: 'encoding', enabled: true, parameters: { method: 'One-Hot Encoding' } },
            { stepId: 'scaling', enabled: true, parameters: { method: 'StandardScaler' } },
            { stepId: 'outliers', enabled: true, parameters: { method: 'Z-Score' } },
            { stepId: 'feature_selection', enabled: true, parameters: { remove_high_correlation: true, low_variance_filtering: true } },
            { stepId: 'train_test_split', enabled: true, parameters: { test_size: 0.2, stratify: true } },
        ],
        createdAt: new Date().toISOString()
    },
    {
        id: 'dataset-eda-ready',
        name: 'EDA Ready',
        description: 'Prepare data for exploratory analysis',
        dataType: 'dataset',
        steps: [
            { stepId: 'missing_values', enabled: true, parameters: { strategy: 'Fill with Median' } },
            { stepId: 'encoding', enabled: true, parameters: { method: 'Label Encoding' } },
            { stepId: 'scaling', enabled: true, parameters: { method: 'StandardScaler' } },
            { stepId: 'outliers', enabled: false, parameters: {} },
            { stepId: 'feature_selection', enabled: false, parameters: {} },
            { stepId: 'train_test_split', enabled: false, parameters: {} },
        ],
        createdAt: new Date().toISOString()
    },
    {
        id: 'text-basic-nlp',
        name: 'Basic NLP',
        description: 'Essential text preprocessing for quick analysis',
        dataType: 'text',
        steps: [
            { stepId: 'text_cleaning', enabled: true, parameters: { method: 'Simple' } },
            { stepId: 'tokenization', enabled: true, parameters: {} },
            { stepId: 'stopword_removal', enabled: false, parameters: {} },
            { stepId: 'lemmatization', enabled: false, parameters: {} },
            { stepId: 'vectorization', enabled: true, parameters: { method: 'TF-IDF', max_features: 1000 } },
        ],
        createdAt: new Date().toISOString()
    },
    {
        id: 'text-advanced-nlp',
        name: 'Advanced NLP',
        description: 'Complete text preprocessing pipeline',
        dataType: 'text',
        steps: [
            { stepId: 'text_cleaning', enabled: true, parameters: { method: 'Advanced' } },
            { stepId: 'tokenization', enabled: true, parameters: {} },
            { stepId: 'stopword_removal', enabled: true, parameters: { enabled: true } },
            { stepId: 'lemmatization', enabled: true, parameters: { method: 'Lemmatization' } },
            { stepId: 'vectorization', enabled: true, parameters: { method: 'TF-IDF', max_features: 5000 } },
        ],
        createdAt: new Date().toISOString()
    },
    {
        id: 'image-standard-cnn',
        name: 'Standard CNN',
        description: 'Prepare images for convolutional neural networks',
        dataType: 'image',
        steps: [
            { stepId: 'image_resize', enabled: true, parameters: { width: 224, height: 224 } },
            { stepId: 'image_normalize', enabled: true, parameters: {} },
            { stepId: 'image_augment', enabled: false, parameters: {} },
        ],
        createdAt: new Date().toISOString()
    },
    {
        id: 'image-augmented',
        name: 'With Augmentation',
        description: 'Image preprocessing with data augmentation',
        dataType: 'image',
        steps: [
            { stepId: 'image_resize', enabled: true, parameters: { width: 224, height: 224 } },
            { stepId: 'image_normalize', enabled: true, parameters: {} },
            { stepId: 'image_augment', enabled: true, parameters: { enabled: true } },
        ],
        createdAt: new Date().toISOString()
    },
]

// Initialize default templates on first load
function initializeDefaultTemplates() {
    const hasLoaded = localStorage.getItem(DEFAULT_TEMPLATES_KEY)
    if (!hasLoaded) {
        const existing = getTemplates()
        const combined = [...defaultTemplates, ...existing]
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(combined))
        localStorage.setItem(DEFAULT_TEMPLATES_KEY, 'true')
    }
}

// Get all templates
export function getTemplates(dataType?: string): PreprocessingTemplate[] {
    initializeDefaultTemplates()
    const stored = localStorage.getItem(TEMPLATES_KEY)
    const templates: PreprocessingTemplate[] = stored ? JSON.parse(stored) : []

    if (dataType) {
        return templates.filter(t => t.dataType === dataType)
    }
    return templates
}

// Get a specific template
export function getTemplate(id: string): PreprocessingTemplate | null {
    const templates = getTemplates()
    return templates.find(t => t.id === id) || null
}

// Save a new template
export function saveTemplate(template: Omit<PreprocessingTemplate, 'id' | 'createdAt'>): PreprocessingTemplate {
    const templates = getTemplates()
    const newTemplate: PreprocessingTemplate = {
        ...template,
        id: `custom-${Date.now()}`,
        createdAt: new Date().toISOString()
    }
    templates.push(newTemplate)
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
    return newTemplate
}

// Delete a template
export function deleteTemplate(id: string): boolean {
    // Don't allow deleting default templates
    if (id.startsWith('dataset-') || id.startsWith('text-') || id.startsWith('image-')) {
        return false
    }

    const templates = getTemplates()
    const filtered = templates.filter(t => t.id !== id)
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered))
    return true
}

// Update a template
export function updateTemplate(id: string, updates: Partial<PreprocessingTemplate>): PreprocessingTemplate | null {
    const templates = getTemplates()
    const index = templates.findIndex(t => t.id === id)

    if (index === -1) return null

    templates[index] = { ...templates[index], ...updates }
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
    return templates[index]
}
