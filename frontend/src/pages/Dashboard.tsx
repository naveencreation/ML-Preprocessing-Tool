import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getEDAStats, getHistogram, getBoxplot, getCorrelation } from "@/lib/api"
import PageHeader from "@/components/PageHeader"
import MetricsCard from "@/components/MetricsCard"
import { MetricsGridSkeleton, ChartSkeleton } from "@/components/LoadingSkeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import Plot from "react-plotly.js"
import {
    Database,
    Table,
    AlertCircle,
    FileText,
    GitCompare
} from "lucide-react"

export default function Dashboard() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()

    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [vizData, setVizData] = useState<any>(null)
    const [vizType, setVizType] = useState<string>("None")
    const [selectedCol, setSelectedCol] = useState<string>("")
    const [vizLoading, setVizLoading] = useState(false)

    useEffect(() => {
        if (id) {
            loadStats(parseInt(id))
        }
    }, [id])

    const loadStats = async (datasetId: number) => {
        try {
            const data = await getEDAStats(datasetId)
            setStats(data)
        } catch (error) {
            console.error("Failed to load stats", error)
            toast({
                title: "Error",
                description: "Failed to load EDA statistics",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleVizChange = async (type: string) => {
        setVizType(type)
        setVizData(null)
        if (type === "Correlation") {
            setVizLoading(true)
            try {
                const data = await getCorrelation(parseInt(id!))
                setVizData(data)
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load correlation data",
                    variant: "destructive"
                })
            } finally {
                setVizLoading(false)
            }
        }
    }

    const handleColumnViz = async () => {
        if (!selectedCol || !id) return
        setVizLoading(true)
        try {
            let data
            if (vizType === "Histogram") {
                data = await getHistogram(parseInt(id), selectedCol)
            } else if (vizType === "Boxplot") {
                data = await getBoxplot(parseInt(id), selectedCol)
            }
            setVizData(data)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load visualization",
                variant: "destructive"
            })
        } finally {
            setVizLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-8">
                <PageHeader
                    title="EDA Dashboard"
                    description="Loading dataset statistics..."
                />
                <MetricsGridSkeleton count={4} />
                <div className="grid gap-6 md:grid-cols-2">
                    <ChartSkeleton />
                    <ChartSkeleton />
                </div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Failed to Load Data</h2>
                <p className="text-muted-foreground mb-4">
                    There was an error loading the dataset statistics.
                </p>
                <Button onClick={() => id && loadStats(parseInt(id))}>
                    Retry
                </Button>
            </div>
        )
    }

    const hasParent = stats.parent_dataset_id !== null && stats.parent_dataset_id !== undefined

    // Calculate metrics from the API response structure
    const totalRows = stats.basic_info?.[0]?.['Non-Null Count'] || 0
    const totalColumns = stats.basic_info?.length || 0

    // Calculate total missing values
    const totalMissing = stats.missing ?
        Object.values(stats.missing).reduce((sum: number, val: any) => sum + (val || 0), 0) : 0

    // Calculate memory usage from basic_info
    const memoryUsage = stats.basic_info?.length > 0 ?
        `${Math.round(stats.basic_info.length * totalRows * 8 / 1024)} KB` : "0 KB"

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="EDA Dashboard"
                    description={`Analysis for Dataset`}
                />
                {hasParent && (
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => navigate(`/comparison/${id}`)}
                    >
                        <GitCompare className="h-4 w-4" />
                        View Changes
                        <Badge variant="secondary" className="ml-1">New</Badge>
                    </Button>
                )}
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricsCard
                    title="Total Rows"
                    value={totalRows}
                    icon={Database}
                    description="Total number of records"
                />
                <MetricsCard
                    title="Total Columns"
                    value={totalColumns}
                    icon={Table}
                    description="Number of features"
                />
                <MetricsCard
                    title="Missing Values"
                    value={totalMissing}
                    icon={AlertCircle}
                    description={`Missing data points`}
                    iconColor="text-yellow-500"
                />
                <MetricsCard
                    title="Memory Usage"
                    value={memoryUsage}
                    icon={FileText}
                    description="Total memory footprint"
                />
            </div>

            {/* Visualizations */}
            <Tabs defaultValue="distributions" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="distributions">Distributions</TabsTrigger>
                    <TabsTrigger value="correlations">Correlations</TabsTrigger>
                </TabsList>

                <TabsContent value="distributions" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Column Visualizations</CardTitle>
                            <CardDescription>
                                Select a column and visualization type to explore distributions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-4">
                                <Select value={vizType} onValueChange={handleVizChange}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="None">Select Visualization</SelectItem>
                                        <SelectItem value="Histogram">Histogram</SelectItem>
                                        <SelectItem value="Boxplot">Box Plot</SelectItem>
                                    </SelectContent>
                                </Select>

                                {(vizType === "Histogram" || vizType === "Boxplot") && (
                                    <>
                                        <Select value={selectedCol} onValueChange={setSelectedCol}>
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue placeholder="Select column" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stats.basic_info?.map((col: any) => (
                                                    <SelectItem key={col.Column} value={col.Column}>
                                                        {col.Column}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button onClick={handleColumnViz} disabled={!selectedCol || vizLoading}>
                                            {vizLoading ? "Loading..." : "Generate"}
                                        </Button>
                                    </>
                                )}
                            </div>

                            {vizData && (vizType === "Histogram" || vizType === "Boxplot") && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full h-[500px] border rounded-lg p-4"
                                >
                                    <Plot
                                        data={vizData.data}
                                        layout={{ ...vizData.layout, autosize: true }}
                                        useResizeHandler={true}
                                        style={{ width: "100%", height: "100%" }}
                                        config={{
                                            displayModeBar: true,
                                            displaylogo: false,
                                            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                                            toImageButtonOptions: {
                                                format: 'png',
                                                filename: 'chart_export',
                                                height: 800,
                                                width: 1200,
                                                scale: 2 // Higher resolution
                                            }
                                        }}
                                    />
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="correlations" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Correlation Analysis</CardTitle>
                            <CardDescription>
                                Correlation matrix showing relationships between numeric features
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-4">
                                <Button
                                    onClick={() => handleVizChange("Correlation")}
                                    disabled={vizLoading}
                                    variant={vizType === "Correlation" ? "default" : "outline"}
                                >
                                    {vizLoading ? "Loading..." : "Load Correlation Matrix"}
                                </Button>
                            </div>

                            {vizData && vizType === "Correlation" && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full h-[600px] border rounded-lg p-4"
                                >
                                    <Plot
                                        data={vizData.data}
                                        layout={{ ...vizData.layout, autosize: true }}
                                        useResizeHandler={true}
                                        style={{ width: "100%", height: "100%" }}
                                        config={{
                                            displayModeBar: true,
                                            displaylogo: false,
                                            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                                            toImageButtonOptions: {
                                                format: 'png',
                                                filename: 'chart_export',
                                                height: 800,
                                                width: 1200,
                                                scale: 2 // Higher resolution
                                            }
                                        }}
                                    />
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
