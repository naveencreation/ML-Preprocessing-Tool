import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import PageHeader from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Play, Loader2, Code2, Sparkles, Database, Activity, Split, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { getDatasetPreview, applyPreprocessing, generatePreprocessingCode } from "@/lib/api"
import type { PreprocessingOptions } from "@/lib/api"
import InfoTooltip from "@/components/InfoTooltip"
import CodeBlock from "@/components/CodeBlock"
import {
    missingValueExplanations,
    encodingExplanations,
    scalingExplanations,
    outlierExplanations,
    featureEngineeringExplanations,
    featureSelectionExplanations,
    targetExplanations
} from "@/lib/preprocessing-explanations"
import { MultiSelect } from "@/components/MultiSelect"
import { SaveTemplateDialog } from "@/components/SaveTemplateDialog"
import { LoadTemplateDialog } from "@/components/LoadTemplateDialog"
import { QualityReport } from "@/components/QualityReport"

export default function Preprocessing() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [preview, setPreview] = useState<any[]>([])
    const [generatedCode, setGeneratedCode] = useState<string | null>(null)


    const [options, setOptions] = useState<PreprocessingOptions>({
        missing_option: "Drop Rows",
        encoding_method: "None",
        scaling_method: "None",
        outlier_method: "None",
        feature_engineering_method: "None",
        columns: [],
        // Defaults for new options
        remove_duplicates: false,
        fix_numeric_formats: false,
        fix_date_formats: false,
        standardize_text: false,
        target_encoding: false,
        frequency_encoding: false,
        date_feature_extraction: false,
        text_feature_extraction: false,
        rare_category_handling: false,
        target_column: "",
        smote_oversampling: false,
        remove_high_correlation: false,
        low_variance_filtering: false,
        train_test_split: false,
        test_size: 0.2,
        stratify: false
    })

    useEffect(() => {
        if (id) {
            loadPreview(parseInt(id))
        }
    }, [id])

    const loadPreview = async (datasetId: number) => {
        setLoading(true)
        try {
            const data = await getDatasetPreview(datasetId)
            setPreview(data)
        } catch (error) {
            console.error("Failed to load preview", error)
            toast({
                title: "Error",
                description: "Failed to load dataset preview",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateCode = async () => {
        if (!id) return
        try {
            const result = await generatePreprocessingCode(parseInt(id), options)
            setGeneratedCode(result.code)

        } catch (error) {
            console.error("Failed to generate code", error)
            toast({
                title: "Error",
                description: "Failed to generate code",
                variant: "destructive"
            })
        }
    }

    const handleProcess = async () => {
        if (!id) return
        setProcessing(true)

        try {
            await handleGenerateCode()
            const newDataset = await applyPreprocessing(parseInt(id), options)
            toast({
                title: "Success!",
                description: "Dataset preprocessed successfully"
            })
            setTimeout(() => {
                navigate(`/dashboard/${newDataset.id}`)
            }, 2000)
        } catch (error) {
            console.error("Processing failed", error)
            toast({
                title: "Error",
                description: "Failed to process dataset",
                variant: "destructive"
            })
        } finally {
            setProcessing(false)
        }
    }

    const handleLoadTemplate = (config: PreprocessingOptions) => {
        const { columns, ...rest } = config
        setOptions(prev => ({
            ...prev,
            ...rest
        }))
    }

    const missingExplanation = missingValueExplanations[options.missing_option]
    const encodingExplanation = encodingExplanations[options.encoding_method]
    const scalingExplanation = scalingExplanations[options.scaling_method]

    const columnOptions = preview.length > 0
        ? Object.keys(preview[0]).map(col => ({ label: col, value: col }))
        : []

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {processing && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <p className="text-lg font-medium">Processing dataset...</p>
                    </div>
                </div>
            )}

            <PageHeader
                title="Data Preprocessing"
                description="Clean and transform your dataset for analysis"
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1"
                >
                    <Card className="sticky top-20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <Settings className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>Configuration</CardTitle>
                                    <CardDescription>Set processing parameters</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="flex gap-2 mb-4">
                                <LoadTemplateDialog onSelect={handleLoadTemplate} />
                                <SaveTemplateDialog config={options} />
                                <Button variant="outline" onClick={() => {
                                    const blob = new Blob([JSON.stringify(options, null, 2)], { type: "application/json" })
                                    const url = URL.createObjectURL(blob)
                                    const a = document.createElement("a")
                                    a.href = url
                                    a.download = "preprocessing_config.json"
                                    document.body.appendChild(a)
                                    a.click()
                                    document.body.removeChild(a)
                                    URL.revokeObjectURL(url)
                                }}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Export Config
                                </Button>
                                {id && <QualityReport datasetId={parseInt(id)} />}
                            </div>

                            <Tabs defaultValue="cleaning" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="cleaning" title="Cleaning"><Sparkles className="h-4 w-4" /></TabsTrigger>
                                    <TabsTrigger value="missing" title="Missing/Outliers"><Database className="h-4 w-4" /></TabsTrigger>
                                    <TabsTrigger value="engineering" title="Engineering"><Activity className="h-4 w-4" /></TabsTrigger>
                                    <TabsTrigger value="target" title="Target/Split"><Split className="h-4 w-4" /></TabsTrigger>
                                </TabsList>

                                <TabsContent value="cleaning" className="space-y-4 mt-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="remove-duplicates">Remove Duplicates</Label>
                                            <Switch
                                                id="remove-duplicates"
                                                checked={options.remove_duplicates}
                                                onCheckedChange={(c) => setOptions({ ...options, remove_duplicates: c })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="fix-numeric">Fix Numeric Formats</Label>
                                            <Switch
                                                id="fix-numeric"
                                                checked={options.fix_numeric_formats}
                                                onCheckedChange={(c) => setOptions({ ...options, fix_numeric_formats: c })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="fix-date">Fix Date Formats</Label>
                                            <Switch
                                                id="fix-date"
                                                checked={options.fix_date_formats}
                                                onCheckedChange={(c) => setOptions({ ...options, fix_date_formats: c })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="standardize-text">Standardize Text</Label>
                                            <Switch
                                                id="standardize-text"
                                                checked={options.standardize_text}
                                                onCheckedChange={(c) => setOptions({ ...options, standardize_text: c })}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="missing" className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Label>Missing Values</Label>
                                            <InfoTooltip content={missingExplanation} />
                                        </div>
                                        <Select
                                            value={options.missing_option}
                                            onValueChange={(v) => setOptions({ ...options, missing_option: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Drop Rows">Drop Rows</SelectItem>
                                                <SelectItem value="Fill with Mean">Fill with Mean</SelectItem>
                                                <SelectItem value="Fill with Median">Fill with Median</SelectItem>
                                                <SelectItem value="Fill with Mode">Fill with Mode</SelectItem>
                                                <SelectItem value="Forward Fill">Forward Fill</SelectItem>
                                                <SelectItem value="Backward Fill">Backward Fill</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Label>Outlier Detection</Label>
                                            <InfoTooltip content={outlierExplanations[options.outlier_method || "None"]} />
                                        </div>
                                        <Select
                                            value={options.outlier_method || "None"}
                                            onValueChange={(value) => setOptions({ ...options, outlier_method: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                <SelectItem value="Z-Score">Z-Score (Standard Deviation)</SelectItem>
                                                <SelectItem value="IQR">IQR (Interquartile Range)</SelectItem>
                                                <SelectItem value="Cap Outliers">Cap Outliers (5th-95th)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TabsContent>

                                <TabsContent value="engineering" className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Label>Encoding Method</Label>
                                            <InfoTooltip content={encodingExplanation} />
                                        </div>
                                        <Select
                                            value={options.encoding_method}
                                            onValueChange={(v) => setOptions({ ...options, encoding_method: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None (Skip)</SelectItem>
                                                <SelectItem value="Label Encoding">Label Encoding</SelectItem>
                                                <SelectItem value="One-Hot Encoding">One-Hot Encoding</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Label>Scaling Method</Label>
                                            <InfoTooltip content={scalingExplanation} />
                                        </div>
                                        <Select
                                            value={options.scaling_method}
                                            onValueChange={(v) => setOptions({ ...options, scaling_method: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None (Skip)</SelectItem>
                                                <SelectItem value="StandardScaler">Standard Scaler</SelectItem>
                                                <SelectItem value="MinMaxScaler">Min-Max Scaler</SelectItem>
                                                <SelectItem value="RobustScaler">Robust Scaler</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Advanced Engineering</Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor="date-feat" className="text-xs">Date Features</Label>
                                                    <InfoTooltip content={featureEngineeringExplanations["Date Features"]} />
                                                </div>
                                                <Switch id="date-feat" checked={options.date_feature_extraction} onCheckedChange={(c) => setOptions({ ...options, date_feature_extraction: c })} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor="text-feat" className="text-xs">Text Features</Label>
                                                    <InfoTooltip content={featureEngineeringExplanations["Text Features"]} />
                                                </div>
                                                <Switch id="text-feat" checked={options.text_feature_extraction} onCheckedChange={(c) => setOptions({ ...options, text_feature_extraction: c })} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor="rare-cat" className="text-xs">Rare Categories</Label>
                                                    <InfoTooltip content={featureEngineeringExplanations["Rare Categories"]} />
                                                </div>
                                                <Switch id="rare-cat" checked={options.rare_category_handling} onCheckedChange={(c) => setOptions({ ...options, rare_category_handling: c })} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor="poly-feat" className="text-xs">Polynomial Features</Label>
                                                    <InfoTooltip content={featureEngineeringExplanations["Polynomial Features"]} />
                                                </div>
                                                <Switch
                                                    id="poly-feat"
                                                    checked={options.feature_engineering_method === "Polynomial Features"}
                                                    onCheckedChange={(c) => setOptions({ ...options, feature_engineering_method: c ? "Polynomial Features" : "None" })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="target" className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label>Target Column</Label>
                                        <Select
                                            value={options.target_column || "none"}
                                            onValueChange={(v) => setOptions({ ...options, target_column: v === "none" ? "" : v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select target..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {columnOptions.map(col => (
                                                    <SelectItem key={col.value} value={col.value}>{col.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {options.target_column && (
                                        <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor="target-enc">Target Encoding</Label>
                                                    <InfoTooltip content={encodingExplanations["Target Encoding"]} />
                                                </div>
                                                <Switch id="target-enc" checked={options.target_encoding} onCheckedChange={(c) => setOptions({ ...options, target_encoding: c })} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor="smote">SMOTE Oversampling</Label>
                                                    <InfoTooltip content={targetExplanations["SMOTE"]} />
                                                </div>
                                                <Switch id="smote" checked={options.smote_oversampling} onCheckedChange={(c) => setOptions({ ...options, smote_oversampling: c })} />
                                            </div>

                                            <Separator className="my-2" />

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Train/Test Split</Label>
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="tt-split" className="text-xs">Enable Split</Label>
                                                    <Switch id="tt-split" checked={options.train_test_split} onCheckedChange={(c) => setOptions({ ...options, train_test_split: c })} />
                                                </div>
                                                {options.train_test_split && (
                                                    <div className="flex items-center justify-between mt-2">
                                                        <Label htmlFor="stratify" className="text-xs">Stratify by Target</Label>
                                                        <Switch id="stratify" checked={options.stratify} onCheckedChange={(c) => setOptions({ ...options, stratify: c })} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <Separator />

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Feature Selection</Label>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="high-corr" className="text-xs">Remove High Correlation</Label>
                                                <InfoTooltip content={featureSelectionExplanations["High Correlation"]} />
                                            </div>
                                            <Switch id="high-corr" checked={options.remove_high_correlation} onCheckedChange={(c) => setOptions({ ...options, remove_high_correlation: c })} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="low-var" className="text-xs">Low Variance Filter</Label>
                                                <InfoTooltip content={featureSelectionExplanations["Low Variance"]} />
                                            </div>
                                            <Switch id="low-var" checked={options.low_variance_filtering} onCheckedChange={(c) => setOptions({ ...options, low_variance_filtering: c })} />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Select Columns (Optional)</Label>
                                <MultiSelect
                                    options={columnOptions}
                                    selected={options.columns || []}
                                    onChange={(selected) => setOptions({ ...options, columns: selected })}
                                    placeholder="Select columns to process..."
                                />
                                <p className="text-xs text-muted-foreground">
                                    Leave empty to process all columns.
                                </p>
                            </div>

                            <Button className="w-full" onClick={handleProcess} disabled={processing}>
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-4 w-4" />
                                        Process Dataset
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <Code2 className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>Generated Code</CardTitle>
                                    <CardDescription>Preview the Python code for your pipeline</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-end mb-4">
                                <Button variant="outline" onClick={handleGenerateCode}>
                                    <Code2 className="mr-2 h-4 w-4" />
                                    Generate/Update Code
                                </Button>
                            </div>
                            {generatedCode ? (
                                <CodeBlock code={generatedCode} language="python" />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <Code2 className="h-12 w-12 mb-4 opacity-50" />
                                    <p>Select options and click "Generate Code" to preview</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div >
        </div >
    )
}
