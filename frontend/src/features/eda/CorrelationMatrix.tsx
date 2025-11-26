import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, GitMerge } from "lucide-react"
import Plot from "react-plotly.js"
import { getCorrelation } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface CorrelationMatrixProps {
    datasetId: number
}

export function CorrelationMatrix({ datasetId }: CorrelationMatrixProps) {
    const { toast } = useToast()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const loadCorrelation = async () => {
        setLoading(true)
        try {
            const result = await getCorrelation(datasetId)
            setData(result)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load correlation matrix",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <GitMerge className="h-5 w-5 text-primary" />
                            Correlation Matrix
                        </CardTitle>
                        <CardDescription>Heatmap of feature relationships</CardDescription>
                    </div>
                    {!data && (
                        <Button onClick={loadCorrelation} disabled={loading} size="sm">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Load Matrix
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-[500px] p-4">
                {data ? (
                    <div className="w-full h-full border rounded-xl overflow-hidden">
                        <Plot
                            data={data.data}
                            layout={{
                                ...data.layout,
                                autosize: true,
                                paper_bgcolor: 'rgba(0,0,0,0)',
                                plot_bgcolor: 'rgba(0,0,0,0)',
                                font: { color: 'hsl(var(--foreground))' },
                                margin: { l: 50, r: 50, b: 50, t: 50 }
                            }}
                            useResizeHandler={true}
                            style={{ width: "100%", height: "100%" }}
                            config={{ responsive: true, displayModeBar: false }}
                        />
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                        <GitMerge className="h-12 w-12 mb-4 opacity-20" />
                        <p>Click "Load Matrix" to analyze correlations</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
