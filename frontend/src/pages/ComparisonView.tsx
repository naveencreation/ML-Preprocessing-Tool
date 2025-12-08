import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Loader2, TrendingDown, TrendingUp, Plus, Minus, Brain, BarChart2, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { downloadDataset, exportNotebook, getDatasetComparison, getDatasetLogs } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import PageHeader from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Download, FileCode } from "lucide-react"

interface ComparisonData {
    original: {
        rows: number
        columns: number
        column_names: string[]
        missing_values: Record<string, number>
        dtypes: Record<string, string>
    }
    processed: {
        rows: number
        columns: number
        column_names: string[]
        missing_values: Record<string, number>
        dtypes: Record<string, string>
    }
    changes: {
        rows_removed: number
        columns_added: number
        columns_removed: string[]
        columns_added_names: string[]
    }
}

export default function ComparisonView() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [comparison, setComparison] = useState<ComparisonData | null>(null)
    const [logs, setLogs] = useState<any[]>([])

    useEffect(() => {
        if (id) {
            loadComparison(parseInt(id))
        }
    }, [id])

    const loadComparison = async (datasetId: number) => {
        setLoading(true)
        try {
            const [compData, logData] = await Promise.all([
                getDatasetComparison(datasetId),
                getDatasetLogs(datasetId)
            ])
            setComparison(compData)
            setLogs(logData)
        } catch (error: any) {
            console.error("Failed to load comparison", error)
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to load comparison data",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = () => {
        if (id) {
            downloadDataset(parseInt(id))
            toast({
                title: "Download started",
                description: "Your processed dataset is downloading...",
            })
        }
    }

    const handleExportNotebook = async () => {
        if (!id || !logs.length) return

        // Find the preprocessing log to get options
        const preprocessingLog = logs.find(l => l.step_name === "preprocessing") || logs[0]
        const options = preprocessingLog?.parameters || {}

        try {
            const blob = await exportNotebook(parseInt(id), options)
            const url = window.URL.createObjectURL(new Blob([blob]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `preprocessing_notebook_${id}.ipynb`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            toast({
                title: "Notebook exported",
                description: "Jupyter notebook has been downloaded.",
            })
        } catch (error) {
            toast({
                title: "Export failed",
                description: "Failed to export notebook.",
                variant: "destructive"
            })
        }
    }

    if (loading) {
        return (
            <div className="flex h-[500px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!comparison) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No comparison data available</p>
            </div>
        )
    }

    const totalMissingOriginal = Object.values(comparison.original.missing_values).reduce((a, b) => a + b, 0)
    const totalMissingProcessed = Object.values(comparison.processed.missing_values).reduce((a, b) => a + b, 0)

    return (
        <div className="space-y-6">
            <PageHeader
                title="Before & After Comparison"
                description="See exactly what changed during preprocessing"
                actions={
                    <>
                        <Button variant="outline" onClick={handleExportNotebook}>
                            <FileCode className="mr-2 h-4 w-4" />
                            Export Notebook
                        </Button>
                        <Button onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Data
                        </Button>
                    </>
                }
            />

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Rows</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold">{comparison.original.rows}</span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <span className="text-2xl font-bold">{comparison.processed.rows}</span>
                            </div>
                            {comparison.changes.rows_removed > 0 && (
                                <div className="flex items-center gap-1 mt-2 text-sm text-orange-600">
                                    <TrendingDown className="h-3 w-3" />
                                    <span>-{comparison.changes.rows_removed} rows removed</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Columns</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold">{comparison.original.columns}</span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <span className="text-2xl font-bold">{comparison.processed.columns}</span>
                            </div>
                            {comparison.changes.columns_added > 0 && (
                                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>+{comparison.changes.columns_added} columns added</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Missing Values</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold">{totalMissingOriginal}</span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <span className="text-2xl font-bold">{totalMissingProcessed}</span>
                            </div>
                            {totalMissingOriginal > totalMissingProcessed && (
                                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                                    <TrendingDown className="h-3 w-3" />
                                    <span>-{totalMissingOriginal - totalMissingProcessed} fixed</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Data Quality</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {totalMissingProcessed === 0 ? "100%" : Math.round((1 - totalMissingProcessed / (comparison.processed.rows * comparison.processed.columns)) * 100) + "%"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {totalMissingProcessed === 0 ? "No missing values" : "Some missing values remain"}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Original Dataset */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Original Dataset</CardTitle>
                                <Badge variant="outline">Before</Badge>
                            </div>
                            <CardDescription>Raw data before preprocessing</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold mb-2">Columns ({comparison.original.columns})</h4>
                                <div className="flex flex-wrap gap-2">
                                    {comparison.original.column_names.map((col) => (
                                        <Badge
                                            key={col}
                                            variant={comparison.changes.columns_removed.includes(col) ? "destructive" : "secondary"}
                                        >
                                            {col}
                                            {comparison.changes.columns_removed.includes(col) && (
                                                <Minus className="h-3 w-3 ml-1" />
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="text-sm font-semibold mb-2">Data Types</h4>
                                <div className="space-y-1 text-sm">
                                    {Object.entries(comparison.original.dtypes).slice(0, 5).map(([col, dtype]) => (
                                        <div key={col} className="flex justify-between">
                                            <span className="text-muted-foreground">{col}:</span>
                                            <code className="text-xs bg-muted px-2 py-0.5 rounded">{dtype}</code>
                                        </div>
                                    ))}
                                    {Object.keys(comparison.original.dtypes).length > 5 && (
                                        <p className="text-xs text-muted-foreground italic">
                                            ... and {Object.keys(comparison.original.dtypes).length - 5} more
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="text-sm font-semibold mb-2">Missing Values</h4>
                                {totalMissingOriginal > 0 ? (
                                    <div className="space-y-1 text-sm">
                                        {Object.entries(comparison.original.missing_values)
                                            .filter(([_, count]) => count > 0)
                                            .slice(0, 5)
                                            .map(([col, count]) => (
                                                <div key={col} className="flex justify-between">
                                                    <span className="text-muted-foreground">{col}:</span>
                                                    <span className="text-orange-600 font-medium">{count}</span>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-green-600">No missing values</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Processed Dataset */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Processed Dataset</CardTitle>
                                <Badge variant="default">After</Badge>
                            </div>
                            <CardDescription>Cleaned data after preprocessing</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold mb-2">Columns ({comparison.processed.columns})</h4>
                                <div className="flex flex-wrap gap-2">
                                    {comparison.processed.column_names.map((col) => (
                                        <Badge
                                            key={col}
                                            variant={comparison.changes.columns_added_names.includes(col) ? "default" : "secondary"}
                                        >
                                            {col}
                                            {comparison.changes.columns_added_names.includes(col) && (
                                                <Plus className="h-3 w-3 ml-1" />
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="text-sm font-semibold mb-2">Data Types</h4>
                                <div className="space-y-1 text-sm">
                                    {Object.entries(comparison.processed.dtypes).slice(0, 5).map(([col, dtype]) => (
                                        <div key={col} className="flex justify-between">
                                            <span className="text-muted-foreground">{col}:</span>
                                            <code className="text-xs bg-muted px-2 py-0.5 rounded">{dtype}</code>
                                        </div>
                                    ))}
                                    {Object.keys(comparison.processed.dtypes).length > 5 && (
                                        <p className="text-xs text-muted-foreground italic">
                                            ... and {Object.keys(comparison.processed.dtypes).length - 5} more
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="text-sm font-semibold mb-2">Missing Values</h4>
                                {totalMissingProcessed > 0 ? (
                                    <div className="space-y-1 text-sm">
                                        {Object.entries(comparison.processed.missing_values)
                                            .filter(([_, count]) => count > 0)
                                            .slice(0, 5)
                                            .map(([col, count]) => (
                                                <div key={col} className="flex justify-between">
                                                    <span className="text-muted-foreground">{col}:</span>
                                                    <span className="text-orange-600 font-medium">{count}</span>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-green-600">✓ No missing values</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Changes Summary */}
            {(comparison.changes.columns_added_names.length > 0 || comparison.changes.columns_removed.length > 0) && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Changes Summary</CardTitle>
                            <CardDescription>What preprocessing did to your data</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {comparison.changes.columns_added_names.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-green-600">
                                        <Plus className="h-4 w-4" />
                                        Columns Added ({comparison.changes.columns_added_names.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {comparison.changes.columns_added_names.map((col) => (
                                            <Badge key={col} variant="default">{col}</Badge>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        💡 Likely from one-hot encoding categorical columns
                                    </p>
                                </div>
                            )}

                            {comparison.changes.columns_removed.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-orange-600">
                                        <Minus className="h-4 w-4" />
                                        Columns Removed ({comparison.changes.columns_removed.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {comparison.changes.columns_removed.map((col) => (
                                            <Badge key={col} variant="destructive">{col}</Badge>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        💡 Original categorical columns replaced by encoded versions
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Next Steps */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            What's Next?
                        </CardTitle>
                        <CardDescription>Your data is now clean and ready. Choose your next step:</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Button
                                variant="outline"
                                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                                onClick={() => navigate(`/intelligence/${id}`)}
                            >
                                <Brain className="w-8 h-8 text-purple-600" />
                                <span className="font-semibold">AI Intelligence</span>
                                <span className="text-xs text-muted-foreground">Get AI-powered insights</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                onClick={() => navigate(`/dashboard/${id}`)}
                            >
                                <BarChart2 className="w-8 h-8 text-blue-600" />
                                <span className="font-semibold">View Dashboard</span>
                                <span className="text-xs text-muted-foreground">Explore your clean data</span>
                            </Button>
                            <Button
                                variant="default"
                                className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                onClick={handleDownload}
                            >
                                <Download className="w-8 h-8" />
                                <span className="font-semibold">Download Data</span>
                                <span className="text-xs opacity-80">Get the processed CSV</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
