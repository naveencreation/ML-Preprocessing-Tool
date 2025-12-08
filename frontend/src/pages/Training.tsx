import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Play, CheckCircle } from "lucide-react"
import { getDataset, trainModel, type TrainingOptions, type TrainingResult } from "@/lib/api"
import PageHeader from "@/components/PageHeader"

export default function Training() {
    const { id } = useParams<{ id: string }>()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [dataset, setDataset] = useState<any>(null)
    const [result, setResult] = useState<TrainingResult | null>(null)

    // Options
    const [targetColumn, setTargetColumn] = useState("")
    const [modelType, setModelType] = useState("logistic_regression")
    const [testSize, setTestSize] = useState(0.2)
    const [crossValidation, setCrossValidation] = useState(false)
    const [cvFolds, setCvFolds] = useState(5)

    useEffect(() => {
        const loadDataset = async () => {
            try {
                const data = await getDataset(parseInt(id!))
                setDataset(data)
            } catch (error) {
                console.error(error)
                toast({
                    title: "Error",
                    description: "Failed to load dataset",
                    variant: "destructive",
                })
            }
        }
        loadDataset()
    }, [id, toast])

    const handleTrain = async () => {
        if (!targetColumn) {
            toast({
                title: "Error",
                description: "Please select a target column",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)
        try {
            const options: TrainingOptions = {
                target_column: targetColumn,
                model_type: modelType,
                test_size: testSize,
                cross_validation: crossValidation,
                cv_folds: cvFolds
            }

            const res = await trainModel(parseInt(id!), options)
            setResult(res)
            toast({
                title: "Success",
                description: "Model trained successfully!",
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Training failed",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (!dataset) return <div className="p-8">Loading...</div>

    return (
        <div className="container mx-auto py-6 space-y-6">
            <PageHeader
                title="Model Training"
                description={`Train a model on ${dataset.filename}`}
                breadcrumbs={[
                    { label: "Datasets", href: "/datasets" },
                    { label: dataset.filename, href: `/preprocessing/${dataset.parent_dataset_id || id}` },
                    { label: "Training", href: "#" },
                ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Configuration */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Configuration</CardTitle>
                        <CardDescription>Set training parameters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Target Column</Label>
                            <Input
                                placeholder="e.g., target"
                                value={targetColumn}
                                onChange={(e) => setTargetColumn(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">The column you want to predict.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Model Type</Label>
                            <Select value={modelType} onValueChange={setModelType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="logistic_regression">Logistic Regression</SelectItem>
                                    <SelectItem value="random_forest_classifier">Random Forest Classifier</SelectItem>
                                    <SelectItem value="decision_tree_classifier">Decision Tree Classifier</SelectItem>
                                    <SelectItem value="linear_regression">Linear Regression</SelectItem>
                                    <SelectItem value="random_forest_regressor">Random Forest Regressor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Test Size (0.1 - 0.5)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0.1"
                                max="0.5"
                                value={testSize}
                                onChange={(e) => setTestSize(parseFloat(e.target.value))}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                            <Label htmlFor="cv-mode">Cross Validation</Label>
                            <Switch
                                id="cv-mode"
                                checked={crossValidation}
                                onCheckedChange={setCrossValidation}
                            />
                        </div>

                        {crossValidation && (
                            <div className="space-y-2">
                                <Label>Folds (k)</Label>
                                <Input
                                    type="number"
                                    min="2"
                                    max="10"
                                    value={cvFolds}
                                    onChange={(e) => setCvFolds(parseInt(e.target.value))}
                                />
                            </div>
                        )}

                        <Button className="w-full" onClick={handleTrain} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                            Train Model
                        </Button>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="md:col-span-2 space-y-6">
                    {result ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="text-green-500 h-5 w-5" />
                                    Training Results
                                </CardTitle>
                                <CardDescription>Model performance metrics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.entries(result.metrics).map(([key, value]) => (
                                        <div key={key} className="p-4 border rounded-lg bg-muted/50">
                                            <div className="text-sm font-medium text-muted-foreground capitalize">
                                                {key.replace(/_/g, " ")}
                                            </div>
                                            <div className="text-2xl font-bold">
                                                {typeof value === 'number' ? value.toFixed(4) : value}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 p-4 bg-slate-950 text-slate-50 rounded-md font-mono text-sm break-all">
                                    <p className="text-xs text-slate-400 mb-2">Model Artifact Path:</p>
                                    {result.model_path}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg p-12 text-muted-foreground">
                            Configure settings and click Train to see results
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
