import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, BarChart2 } from "lucide-react"
import Plot from "react-plotly.js"
import { getHistogram, getBoxplot } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface DistributionAnalysisProps {
    datasetId: number
    columns: any[]
}

export function DistributionAnalysis({ datasetId, columns }: DistributionAnalysisProps) {
    const { toast } = useToast()
    const [selectedCol, setSelectedCol] = useState<string>("")
    const [vizType, setVizType] = useState<"Histogram" | "Boxplot">("Histogram")
    const [vizData, setVizData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const handleGenerate = async () => {
        if (!selectedCol) return
        setLoading(true)
        try {
            let data
            if (vizType === "Histogram") {
                data = await getHistogram(datasetId, selectedCol)
            } else {
                data = await getBoxplot(datasetId, selectedCol)
            }
            setVizData(data)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to generate visualization",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    Distribution Analysis
                </CardTitle>
                <CardDescription>Visualize the distribution of individual features</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="space-y-2 min-w-[200px]">
                        <label className="text-sm font-medium">Column</label>
                        <Select value={selectedCol} onValueChange={setSelectedCol}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                                {columns.map((col) => (
                                    <SelectItem key={col.Column} value={col.Column}>
                                        {col.Column}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 min-w-[150px]">
                        <label className="text-sm font-medium">Chart Type</label>
                        <Select value={vizType} onValueChange={(v: any) => setVizType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Histogram">Histogram</SelectItem>
                                <SelectItem value="Boxplot">Box Plot</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleGenerate} disabled={!selectedCol || loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Generate Chart
                    </Button>
                </div>

                <div className="flex-1 min-h-[400px] border rounded-xl bg-muted/10 p-4 relative">
                    {vizData ? (
                        <Plot
                            data={vizData.data}
                            layout={{
                                ...vizData.layout,
                                autosize: true,
                                paper_bgcolor: 'rgba(0,0,0,0)',
                                plot_bgcolor: 'rgba(0,0,0,0)',
                                font: { color: 'hsl(var(--foreground))' }
                            }}
                            useResizeHandler={true}
                            style={{ width: "100%", height: "100%" }}
                            config={{ responsive: true, displayModeBar: false }}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            Select a column to view its distribution
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
