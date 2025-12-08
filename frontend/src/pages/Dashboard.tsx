import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, GitCompare, LayoutDashboard, BarChart2, GitMerge, Brain } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getEDAStats } from "@/lib/api"
import { SmartInsights } from "@/features/eda/SmartInsights"
import { DistributionAnalysis } from "@/features/eda/DistributionAnalysis"
import { CorrelationMatrix } from "@/features/eda/CorrelationMatrix"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function Dashboard() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()

    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    if (!stats) return null

    const hasParent = stats.parent_dataset_id !== null && stats.parent_dataset_id !== undefined
    const columns = stats.basic_info || []

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 pb-8"
        >
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Exploratory Data Analysis"
                    description="Analyze distributions, correlations, and data quality"
                />
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="gap-2 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/50 dark:border-purple-800 dark:text-purple-300"
                        onClick={() => navigate(`/intelligence/${id}`)}
                    >
                        <Brain className="h-4 w-4" />
                        AI Intelligence
                    </Button>
                    {hasParent && (
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => navigate(`/comparison/${id}`)}
                        >
                            <GitCompare className="h-4 w-4" />
                            Compare with Original
                        </Button>
                    )}
                    <Button onClick={() => navigate(`/preprocessing/${id}`)}>
                        Go to Preprocessing
                    </Button>
                </div>
            </div>

            {/* Smart Insights Section */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    Key Insights
                </h3>
                <SmartInsights datasetId={parseInt(id!)} />
            </section>

            {/* Main Analysis Tabs */}
            <Tabs defaultValue="distribution" className="space-y-6">
                <div className="flex items-center justify-between border-b pb-2">
                    <TabsList className="bg-transparent p-0">
                        <TabsTrigger
                            value="distribution"
                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg px-4 py-2"
                        >
                            <BarChart2 className="h-4 w-4 mr-2" />
                            Distributions
                        </TabsTrigger>
                        <TabsTrigger
                            value="correlation"
                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg px-4 py-2"
                        >
                            <GitMerge className="h-4 w-4 mr-2" />
                            Correlations
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="distribution" className="mt-0">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <DistributionAnalysis datasetId={parseInt(id!)} columns={columns} />
                        </div>
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Dataset Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Rows</span>
                                        <span className="font-mono font-medium">{stats.basic_info?.[0]?.['Non-Null Count'] || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Columns</span>
                                        <span className="font-mono font-medium">{columns.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Memory</span>
                                        <span className="font-mono font-medium">
                                            {Math.round((stats.basic_info?.length * (stats.basic_info?.[0]?.['Non-Null Count'] || 0) * 8) / 1024)} KB
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Feature Types</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {columns.map((col: any) => (
                                            <div key={col.Column} className="flex justify-between text-sm items-center p-2 rounded hover:bg-muted/50">
                                                <span className="truncate max-w-[150px]" title={col.Column}>{col.Column}</span>
                                                <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground font-mono">
                                                    {col.Dtype}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="correlation" className="mt-0">
                    <CorrelationMatrix datasetId={parseInt(id!)} />
                </TabsContent>
            </Tabs>
        </motion.div>
    )
}
