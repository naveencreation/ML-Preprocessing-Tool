import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import type { PreprocessingOptions } from "@/lib/api"
import type { PipelineStepId } from "./PipelineSteps"
import { EducationalCard } from "./EducationalCard"
import { motion } from "framer-motion"

interface StepConfigProps {
    step: PipelineStepId
    options: PreprocessingOptions
    setOptions: (options: PreprocessingOptions) => void
    columns: { label: string, value: string }[]
    datasetType?: string
}

export function StepConfig({ step, options, setOptions, columns, datasetType = "tabular" }: StepConfigProps) {
    const updateOption = (key: keyof PreprocessingOptions, value: any) => {
        setOptions({ ...options, [key]: value })
    }

    const renderContent = () => {
        switch (step) {
            case "cleaning":
                return (
                    <div className="space-y-6">
                        <EducationalCard
                            title={datasetType === "text" ? "Text Cleaning" : "Data Cleaning"}
                            description={datasetType === "text" ? "Text data needs cleaning to remove noise like HTML tags, URLs, and special characters." : "Raw data often contains duplicates or inconsistent formats. Cleaning ensures your model learns from high-quality, unique examples."}
                            nextStep="After cleaning, we'll handle missing values."
                        />
                        <div className="space-y-4">
                            {datasetType === "text" ? (
                                <>
                                    <div className="space-y-2">
                                        <Label>Text Cleaning Method</Label>
                                        <Select
                                            value={options.text_cleaning_method || "None"}
                                            onValueChange={(v) => updateOption("text_cleaning_method", v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                <SelectItem value="Simple">Simple (Remove Punctuation)</SelectItem>
                                                <SelectItem value="Advanced">Advanced (Remove URLs, HTML, Numbers)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Stopword Removal</Label>
                                            <p className="text-sm text-muted-foreground">Remove common words (the, is, at)</p>
                                        </div>
                                        <Switch
                                            checked={options.stopword_removal}
                                            onCheckedChange={(c) => updateOption("stopword_removal", c)}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Remove Duplicates</Label>
                                            <p className="text-sm text-muted-foreground">Identify and remove identical rows</p>
                                        </div>
                                        <Switch
                                            checked={options.remove_duplicates}
                                            onCheckedChange={(c) => updateOption("remove_duplicates", c)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Fix Numeric Formats</Label>
                                            <p className="text-sm text-muted-foreground">Convert text numbers to actual numbers</p>
                                        </div>
                                        <Switch
                                            checked={options.fix_numeric_formats}
                                            onCheckedChange={(c) => updateOption("fix_numeric_formats", c)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Standardize Text</Label>
                                            <p className="text-sm text-muted-foreground">Lowercase and trim whitespace</p>
                                        </div>
                                        <Switch
                                            checked={options.standardize_text}
                                            onCheckedChange={(c) => updateOption("standardize_text", c)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            case "missing":
                return (
                    <div className="space-y-6">
                        <EducationalCard
                            title="Missing Values"
                            description="Models cannot handle empty values. We can either drop them (if few) or fill them (imputation) to preserve data."
                            nextStep="Next, we'll detect and handle outliers."
                        />
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Imputation Strategy</Label>
                                <Select
                                    value={options.missing_option}
                                    onValueChange={(v) => updateOption("missing_option", v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Drop Rows">Drop Rows (Remove missing)</SelectItem>
                                        <SelectItem value="Fill with Mean">Fill with Mean (Average)</SelectItem>
                                        <SelectItem value="Fill with Median">Fill with Median (Middle value)</SelectItem>
                                        <SelectItem value="Fill with Mode">Fill with Mode (Most frequent)</SelectItem>
                                        <SelectItem value="Forward Fill">Forward Fill (Previous value)</SelectItem>
                                        <SelectItem value="KNN Imputation">KNN Imputation (Nearest Neighbors)</SelectItem>
                                        <SelectItem value="Iterative Imputation">Iterative Imputation (Model-based)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )
            case "outliers":
                return (
                    <div className="space-y-6">
                        <EducationalCard
                            title="Outlier Detection"
                            description="Extreme values can skew your model. We can detect them using statistical methods like Z-Score or IQR."
                            nextStep="Next, we'll encode categorical variables."
                        />
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Detection Method</Label>
                                <Select
                                    value={options.outlier_method || "None"}
                                    onValueChange={(v) => updateOption("outlier_method", v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="None">None</SelectItem>
                                        <SelectItem value="Z-Score">Z-Score (Standard Deviation)</SelectItem>
                                        <SelectItem value="IQR">IQR (Interquartile Range)</SelectItem>
                                        <SelectItem value="Cap Outliers">Cap Outliers (5th-95th percentile)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )
            case "encoding":
                return (
                    <div className="space-y-6">
                        <EducationalCard
                            title="Encoding"
                            description="Machine learning models require numbers. Encoding converts text categories (e.g., 'Red', 'Blue') into numbers."
                            nextStep="Next, we'll scale numerical features."
                        />
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Encoding Strategy</Label>
                                <Select
                                    value={options.encoding_method}
                                    onValueChange={(v) => updateOption("encoding_method", v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="None">None</SelectItem>
                                        <SelectItem value="Label Encoding">Label Encoding (0, 1, 2...)</SelectItem>
                                        <SelectItem value="One-Hot Encoding">One-Hot Encoding (Binary columns)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Rare Category Handling</Label>
                                    <p className="text-sm text-muted-foreground">Group infrequent categories as 'Other'</p>
                                </div>
                                <Switch
                                    checked={options.rare_category_handling}
                                    onCheckedChange={(c) => updateOption("rare_category_handling", c)}
                                />
                            </div>
                        </div>
                    </div>
                )
            case "scaling":
                return (
                    <div className="space-y-6">
                        <EducationalCard
                            title="Scaling"
                            description="Features with different scales (e.g., Age vs Salary) can confuse models. Scaling brings them to a similar range."
                            nextStep="Next, we'll select the most important features."
                        />
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Scaling Method</Label>
                                <Select
                                    value={options.scaling_method}
                                    onValueChange={(v) => updateOption("scaling_method", v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="None">None</SelectItem>
                                        <SelectItem value="StandardScaler">Standard Scaler (Mean=0, Std=1)</SelectItem>
                                        <SelectItem value="MinMaxScaler">Min-Max Scaler (0 to 1)</SelectItem>
                                        <SelectItem value="RobustScaler">Robust Scaler (Resistant to outliers)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )
            case "selection":
                return (
                    <div className="space-y-6">
                        <EducationalCard
                            title="Feature Selection"
                            description="Not all features are useful. Removing redundant (highly correlated) or constant (low variance) features improves model performance and speed."
                            nextStep="Next, we'll engineer new features."
                        />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Remove High Correlation</Label>
                                    <p className="text-sm text-muted-foreground">Drop features that are highly correlated (&gt;0.95)</p>
                                </div>
                                <Switch
                                    checked={options.remove_high_correlation}
                                    onCheckedChange={(c) => updateOption("remove_high_correlation", c)}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Low Variance Filtering</Label>
                                    <p className="text-sm text-muted-foreground">Drop features that barely change (constant values)</p>
                                </div>
                                <Switch
                                    checked={options.low_variance_filtering}
                                    onCheckedChange={(c) => updateOption("low_variance_filtering", c)}
                                />
                            </div>
                        </div>
                    </div>
                )
            case "engineering":
                return (
                    <div className="space-y-6">
                        <EducationalCard
                            title={datasetType === "text" ? "Text Processing" : "Feature Engineering"}
                            description={datasetType === "text" ? "Convert text into numbers (Vectorization) and normalize words (Stemming/Lemmatization)." : "Creating new features from existing ones can improve model performance. E.g., extracting 'Month' from a Date."}
                            nextStep="Finally, we'll split the data for training."
                        />
                        <div className="space-y-4">
                            {datasetType === "text" ? (
                                <>
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Stemming</Label>
                                            <p className="text-sm text-muted-foreground">Reduce words to root (run, running -&gt; run)</p>
                                        </div>
                                        <Switch
                                            checked={options.stemming}
                                            onCheckedChange={(c) => updateOption("stemming", c)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Lemmatization</Label>
                                            <p className="text-sm text-muted-foreground">Reduce words to dictionary form (better than stemming)</p>
                                        </div>
                                        <Switch
                                            checked={options.lemmatization}
                                            onCheckedChange={(c) => updateOption("lemmatization", c)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Vectorization</Label>
                                        <Select
                                            value={options.vectorization_method || "None"}
                                            onValueChange={(v) => updateOption("vectorization_method", v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                <SelectItem value="Count">Count Vectorizer (Bag of Words)</SelectItem>
                                                <SelectItem value="TF-IDF">TF-IDF (Weighted Frequency)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            ) : datasetType === "image" ? (
                                <>
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Resize Image</Label>
                                            <p className="text-sm text-muted-foreground">Resize to standard dimensions (224x224)</p>
                                        </div>
                                        <Switch
                                            checked={options.image_resize}
                                            onCheckedChange={(c) => updateOption("image_resize", c)}
                                        />
                                    </div>
                                    {options.image_resize && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Width</Label>
                                                <input
                                                    type="number"
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={options.image_width || 224}
                                                    onChange={(e) => updateOption("image_width", parseInt(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Height</Label>
                                                <input
                                                    type="number"
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={options.image_height || 224}
                                                    onChange={(e) => updateOption("image_height", parseInt(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Grayscale</Label>
                                            <p className="text-sm text-muted-foreground">Convert to black and white</p>
                                        </div>
                                        <Switch
                                            checked={options.image_grayscale}
                                            onCheckedChange={(c) => updateOption("image_grayscale", c)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Augmentation</Label>
                                            <p className="text-sm text-muted-foreground">Random flips/rotations</p>
                                        </div>
                                        <Switch
                                            checked={options.image_augmentation}
                                            onCheckedChange={(c) => updateOption("image_augmentation", c)}
                                        />
                                    </div>
                                </>
                                    </div>
                    </>
                ) : datasetType === "audio" ? (
                    <>
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                            <div className="space-y-0.5">
                                <Label className="text-base">Trim Silence</Label>
                                <p className="text-sm text-muted-foreground">Remove silent parts from start/end</p>
                            </div>
                            <Switch
                                checked={options.audio_trim_silence}
                                onCheckedChange={(c) => updateOption("audio_trim_silence", c)}
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                            <div className="space-y-0.5">
                                <Label className="text-base">Resample</Label>
                                <p className="text-sm text-muted-foreground">Change sample rate (e.g. to 16kHz)</p>
                            </div>
                            <Switch
                                checked={options.audio_resample}
                                onCheckedChange={(c) => updateOption("audio_resample", c)}
                            />
                        </div>
                        {options.audio_resample && (
                            <div className="space-y-2">
                                <Label>Target Sample Rate (Hz)</Label>
                                <input
                                    type="number"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={options.audio_sample_rate || 16000}
                                    onChange={(e) => updateOption("audio_sample_rate", parseInt(e.target.value))}
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Feature Extraction</Label>
                            <Select
                                value={options.audio_feature_extraction || "None"}
                                onValueChange={(v) => updateOption("audio_feature_extraction", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="None">None (Keep as Audio)</SelectItem>
                                    <SelectItem value="MFCC">MFCC (Mel-frequency cepstral coefficients)</SelectItem>
                                    <SelectItem value="Spectrogram">Spectral Features</SelectItem>
                                    <SelectItem value="Chroma">Chroma Features</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                ) : datasetType === "logs" ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                            <div className="space-y-0.5">
                                <Label className="text-base">Extract Timestamp</Label>
                                <p className="text-sm text-muted-foreground">Find date/time in log lines</p>
                            </div>
                            <Switch
                                checked={options.log_parse_timestamp}
                                onCheckedChange={(c) => updateOption("log_parse_timestamp", c)}
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                            <div className="space-y-0.5">
                                <Label className="text-base">Extract Log Levels</Label>
                                <p className="text-sm text-muted-foreground">Find INFO, ERROR, WARNING</p>
                            </div>
                            <Switch
                                checked={options.log_extract_levels}
                                onCheckedChange={(c) => updateOption("log_extract_levels", c)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Regex Extraction Pattern</Label>
                            <input
                                type="text"
                                placeholder="(?P<ip>\d+\.\d+\.\d+\.\d+)"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={options.log_pattern_extraction || ""}
                                onChange={(e) => updateOption("log_pattern_extraction", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Enter a Python regex with named groups to extract columns.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                            <div className="space-y-0.5">
                                <Label className="text-base">Date Feature Extraction</Label>
                                <p className="text-sm text-muted-foreground">Extract Year, Month, Day from dates</p>
                            </div>
                            <Switch
                                checked={options.date_feature_extraction}
                                onCheckedChange={(c) => updateOption("date_feature_extraction", c)}
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                            <div className="space-y-0.5">
                                <Label className="text-base">Text Feature Extraction</Label>
                                <p className="text-sm text-muted-foreground">Extract length, word count from text</p>
                            </div>
                            <Switch
                                checked={options.text_feature_extraction}
                                onCheckedChange={(c) => updateOption("text_feature_extraction", c)}
                            />
                        </div>

                        {/* Time Series Options (Available for Tabular too) */}
                        {(datasetType === "tabular" || datasetType === "timeseries") && (
                            <div className="pt-6 border-t">
                                <h3 className="text-lg font-medium mb-4">Time-Series Operations</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Resampling</Label>
                                            <p className="text-sm text-muted-foreground">Change frequency (e.g. Daily -> Monthly)</p>
                                        </div>
                                        <Switch
                                            checked={options.ts_resample}
                                            onCheckedChange={(c) => updateOption("ts_resample", c)}
                                        />
                                    </div>
                                    {options.ts_resample && (
                                        <div className="space-y-2">
                                            <Label>Frequency</Label>
                                            <Select
                                                value={options.ts_resample_freq || "D"}
                                                onValueChange={(v) => updateOption("ts_resample_freq", v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="D">Daily</SelectItem>
                                                    <SelectItem value="W">Weekly</SelectItem>
                                                    <SelectItem value="M">Monthly</SelectItem>
                                                    <SelectItem value="H">Hourly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Lag Features</Label>
                                            <p className="text-sm text-muted-foreground">Create previous time step features (t-1)</p>
                                        </div>
                                        <Switch
                                            checked={options.ts_lag_features}
                                            onCheckedChange={(c) => updateOption("ts_lag_features", c)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Rolling Window</Label>
                                            <p className="text-sm text-muted-foreground">Moving average/std deviation</p>
                                        </div>
                                        <Switch
                                            checked={options.ts_rolling_window}
                                            onCheckedChange={(c) => updateOption("ts_rolling_window", c)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )
        }
                        </div >
                    </div >
                )
            case "split":
    return (
        <div className="space-y-6">
            <EducationalCard
                title="Train/Test Split"
                description="To evaluate your model fairly, you must test it on data it hasn't seen before. We split data into Train and Test sets."
                nextStep="You are ready to process the dataset!"
            />
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Target Column</Label>
                    <Select
                        value={options.target_column || "none"}
                        onValueChange={(v) => updateOption("target_column", v === "none" ? "" : v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select target variable..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {columns.map(col => (
                                <SelectItem key={col.value} value={col.value}>{col.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {options.target_column && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center justify-between">
                            <Label>Enable Split</Label>
                            <Switch
                                checked={options.train_test_split}
                                onCheckedChange={(c) => updateOption("train_test_split", c)}
                            />
                        </div>
                        {options.train_test_split && (
                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>Test Size: {options.test_size}</Label>
                                    </div>
                                    {/* Slider could go here */}
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Stratify</Label>
                                    <Switch
                                        checked={options.stratify}
                                        onCheckedChange={(c) => updateOption("stratify", c)}
                                    />
                                </div>
                            </div>
                        )}
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>SMOTE Oversampling</Label>
                                <p className="text-xs text-muted-foreground">Balance classes</p>
                            </div>
                            <Switch
                                checked={options.smote_oversampling}
                                onCheckedChange={(c) => updateOption("smote_oversampling", c)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
    default:
    return null
}
    }

return (
    <motion.div
        key={step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full"
    >
        <Card className="h-full border-none shadow-none bg-transparent">
            <CardContent className="p-0">
                {renderContent()}
            </CardContent>
        </Card>
    </motion.div>
)
}
