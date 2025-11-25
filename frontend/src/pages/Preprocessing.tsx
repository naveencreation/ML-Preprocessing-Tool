import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import PageHeader from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Settings, Play, Loader2, Code2 } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { getDatasetPreview, applyPreprocessing, generatePreprocessingCode } from "@/lib/api"
import type { PreprocessingOptions } from "@/lib/api"
import InfoTooltip, { ExplanationSection, ProsList, ConsList } from "@/components/InfoTooltip"
import CodeBlock from "@/components/CodeBlock"
import { missingValueExplanations, encodingExplanations, scalingExplanations, outlierExplanations, featureEngineeringExplanations } from "@/lib/preprocessing-explanations"
import { MultiSelect } from "@/components/MultiSelect"
import { SaveTemplateDialog } from "@/components/SaveTemplateDialog"
import { LoadTemplateDialog } from "@/components/LoadTemplateDialog"

export default function Preprocessing() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [preview, setPreview] = useState<any[]>([])
    const [generatedCode, setGeneratedCode] = useState<string | null>(null)
    const [showCode, setShowCode] = useState(false)

    const [options, setOptions] = useState<PreprocessingOptions>({
        missing_option: "Drop Rows",
        encoding_method: "None",
        scaling_method: "None",
        outlier_method: "None",
        feature_engineering_method: "None",
        columns: []
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
            setShowCode(true)
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
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Select Columns (Optional)</Label>
                                    <MultiSelect
                                        options={columnOptions}
                                        selected={options.columns || []}
                                        onChange={(selected) => setOptions({ ...options, columns: selected })}
                                        placeholder="Select columns to process..."
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Leave empty to process all columns. Unselected columns will remain unchanged.
                                    </p>
                                </div>

                                <Separator />

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
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <Label>Feature Engineering</Label>
                                        <InfoTooltip content={featureEngineeringExplanations[options.feature_engineering_method || "None"]} />
                                    </div>
                                    <Select
                                        value={options.feature_engineering_method || "None"}
                                        onValueChange={(value) => setOptions({ ...options, feature_engineering_method: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="None">None</SelectItem>
                                            <SelectItem value="Polynomial Features">Polynomial Features (Degree 2)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator />

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
                                        </SelectContent>
                                    </Select>
                                </div>

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
                                        </SelectContent>
                                    </Select>
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
                            </div>
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
            </div>
        </div>
    )
}
