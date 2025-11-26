import { type PreprocessingStepData } from "@/data/preprocessingSteps"

export const mapStepsToApiOptions = (
    dataType: 'dataset' | 'text' | 'image' | 'audio' | 'logs',
    steps: PreprocessingStepData[],
    enabledSteps: Record<string, boolean>,
    stepParameters: Record<string, Record<string, any>>
) => {
    const options: any = {}

    // Map steps to API options based on data type
    steps.forEach(step => {
        if (enabledSteps[step.id]) {
            const params = stepParameters[step.id]

            // Handle Missing Values (Common to all types)
            if (step.id === 'missing_values') {
                const strategy = params.strategy || 'Drop Rows'
                if (strategy === 'Fill with Mean') options.missing_option = 'Mean'
                else if (strategy === 'Fill with Median') options.missing_option = 'Median'
                else if (strategy === 'Fill with Mode') options.missing_option = 'Mode'
                else options.missing_option = strategy
            }

            // Handle Encoding (Tabular)
            if (step.id === 'encoding') {
                const method = params.method || 'One-Hot Encoding'
                if (method === 'Target Encoding') {
                    options.target_encoding = true
                    options.encoding_method = 'None'
                } else {
                    options.encoding_method = method
                }
            }

            // Handle Scaling (Tabular)
            if (step.id === 'scaling') {
                options.scaling_method = params.method || 'None'
            }

            // Handle Outliers (Tabular)
            if (step.id === 'outliers') {
                options.outlier_method = params.method || 'None'
            }

            // Handle Feature Selection (Tabular)
            if (step.id === 'feature_selection') {
                options.remove_high_correlation = params.remove_high_correlation || false
                options.low_variance_filtering = params.low_variance_filtering || false
                // Set a default method if either is enabled, though backend might not strictly require it
                if (options.remove_high_correlation || options.low_variance_filtering) {
                    options.feature_selection_method = 'Statistical'
                }
            }

            // Handle Train-Test Split (Tabular)
            if (step.id === 'train_test_split') {
                options.train_test_split = true
                options.test_size = params.test_size || 0.2
                options.stratify = params.stratify || false
            }

            // Map step parameters to API format
            if (dataType === 'text') {
                if (step.id === 'text_cleaning') options.text_cleaning_method = params.method || 'Simple'
                if (step.id === 'tokenization') options.tokenization = true
                if (step.id === 'stopword_removal') options.stopword_removal = params.enabled !== false
                if (step.id === 'lemmatization') {
                    if (params.method === 'Lemmatization') options.lemmatization = true
                    if (params.method === 'Stemming') options.stemming = true
                }
                if (step.id === 'vectorization') {
                    options.vectorization_method = params.method || 'TF-IDF'
                }
            } else if (dataType === 'image') {
                if (step.id === 'image_resize') {
                    options.image_resize = true
                    options.image_width = params.width || 224
                    options.image_height = params.height || 224
                }
                if (step.id === 'image_normalize') options.image_normalize = true
                if (step.id === 'image_augment') options.image_augmentation = params.enabled || false
            } else if (dataType === 'audio') {
                if (step.id === 'audio_resample') {
                    options.audio_resample = true
                    options.audio_sample_rate = params.target_sr || 16000
                }
                if (step.id === 'audio_trim_silence') options.audio_trim_silence = true
                if (step.id === 'audio_extract_features') {
                    options.audio_feature_extraction = params.feature_type || 'MFCC'
                }
            } else if (dataType === 'logs') {
                if (step.id === 'log_parse_timestamp') options.log_parse_timestamp = true
                if (step.id === 'log_extract_levels') options.log_extract_levels = true
                if (step.id === 'log_pattern_extraction') options.log_pattern_extraction = 'auto'
            }
        }
    })

    // Add defaults for other required fields if not set
    if (!options.missing_option) options.missing_option = 'Drop Rows'
    if (!options.encoding_method) options.encoding_method = 'None'
    if (!options.scaling_method) options.scaling_method = 'None'

    return options
}
