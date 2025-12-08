import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Zap } from "lucide-react"
import { getTrainedModels, predict, type InferenceResult } from "@/lib/api"
import PageHeader from "@/components/PageHeader"

export default function Inference() {
    const { id } = useParams<{ id: string }>()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [models, setModels] = useState<any[]>([])
    const [selectedModel, setSelectedModel] = useState<string>("")
    const [inputData, setInputData] = useState("")
    const [result, setResult] = useState<InferenceResult | null>(null)

    useEffect(() => {
        const loadModels = async () => {
            try {
                const data = await getTrainedModels(parseInt(id!))
                setModels(data)
                if (data.length > 0) {
                    setSelectedModel(data[0].model_path)
                }
            } catch (error) {
                console.error("Failed to load models", error)
            }
        }
        loadModels()
    }, [id])

    const handlePredict = async () => {
        if (!selectedModel) {
            toast({
                title: "Error",
                description: "Please select a model",
                variant: "destructive",
            })
            return
        }

        try {
            // Parse input data (assume CSV format for now)
            // Simple parsing: split by comma
            const data = inputData.split('\n').map(line => {
                const values = line.split(',')
                // Try to convert to numbers if possible
                return values.map(v => {
                    const num = parseFloat(v.trim())
                    return isNaN(num) ? v.trim() : num
                })
            })

            // If only one row, wrap it? Backend expects list of lists?
            // Let's assume user enters raw values matching feature count

            setIsLoading(true)
            const res = await predict(selectedModel, data)
            setResult(res)
            toast({
                title: "Success",
                description: "Prediction complete",
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Prediction failed",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <PageHeader
                title="Inference"
                description="Make predictions using trained models"
                breadcrumbs={[
                    { label: "Datasets", href: "/datasets" },
                    { label: "Inference", href: "#" },
                ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Input Data</CardTitle>
                        <CardDescription>Select model and provide data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Select Model</Label>
                            <Select value={selectedModel} onValueChange={setSelectedModel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {models.map((m, i) => (
                                        <SelectItem key={i} value={m.model_path}>
                                            {m.model_type} ({m.target_column})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Data (CSV format, no header)</Label>
                            <Textarea
                                placeholder="1.2, 3.4, category_a&#10;5.6, 7.8, category_b"
                                value={inputData}
                                onChange={(e) => setInputData(e.target.value)}
                                className="h-32 font-mono"
                            />
                            <p className="text-xs text-muted-foreground">Enter one row per line. Values separated by commas.</p>
                        </div>

                        <Button className="w-full" onClick={handlePredict} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                            Predict
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                        <CardDescription>Model predictions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {result ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-950 text-slate-50 rounded-md font-mono text-sm overflow-auto max-h-[300px]">
                                    <pre>{JSON.stringify(result.predictions, null, 2)}</pre>
                                </div>
                                {result.probabilities && (
                                    <div>
                                        <Label>Probabilities</Label>
                                        <div className="p-4 bg-slate-100 rounded-md font-mono text-xs overflow-auto max-h-[200px] mt-2">
                                            <pre>{JSON.stringify(result.probabilities, null, 2)}</pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg p-12 text-muted-foreground">
                                Predictions will appear here
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
