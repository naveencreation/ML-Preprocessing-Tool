import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
// import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, FileText, AlertOctagon } from "lucide-react"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface QualityReportProps {
    datasetId: number
}

interface QualityStats {
    rows: number
    columns: number
    duplicates: {
        count: number
        percentage: number
    }
    missing: {
        total: number
        percentage: number
        by_column: Record<string, number>
    }
    outliers: {
        total: number
        by_column: Record<string, number>
    }
    memory_usage_bytes: number
}

export function QualityReport({ datasetId }: QualityReportProps) {
    const [stats, setStats] = useState<QualityStats | null>(null)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const fetchReport = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/eda/${datasetId}/quality-report`)
            setStats(response.data)
        } catch (error) {
            console.error("Failed to fetch quality report", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open && !stats) {
            fetchReport()
        }
    }, [open])

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Data Quality Report
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Data Quality Report</DialogTitle>
                    <DialogDescription>
                        Comprehensive analysis of dataset health and issues.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : stats ? (
                    <div className="flex-1 pr-4 overflow-y-auto">
                        <div className="grid gap-4 py-4">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Rows</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.rows.toLocaleString()}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Columns</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.columns}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Memory</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{formatBytes(stats.memory_usage_bytes)}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Health Score</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">
                                            {Math.max(0, 100 - stats.missing.percentage - stats.duplicates.percentage).toFixed(0)}%
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Issues Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Detected Issues</h3>

                                {/* Duplicates */}
                                <div className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <AlertOctagon className={`h-5 w-5 ${stats.duplicates.count > 0 ? "text-red-500" : "text-green-500"}`} />
                                            <span className="font-medium">Duplicate Rows</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {stats.duplicates.count} rows ({stats.duplicates.percentage}%)
                                        </span>
                                    </div>
                                    {stats.duplicates.count > 0 && (
                                        <Progress value={stats.duplicates.percentage} className="h-2" />
                                    )}
                                </div>

                                {/* Missing Values */}
                                <div className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className={`h-5 w-5 ${stats.missing.total > 0 ? "text-yellow-500" : "text-green-500"}`} />
                                            <span className="font-medium">Missing Values</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {stats.missing.total} cells ({stats.missing.percentage}%)
                                        </span>
                                    </div>
                                    {stats.missing.total > 0 && (
                                        <div className="space-y-2">
                                            <Progress value={stats.missing.percentage} className="h-2" />
                                            <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2 mt-2">
                                                {Object.entries(stats.missing.by_column).map(([col, count]) => (
                                                    <div key={col} className="flex justify-between">
                                                        <span>{col}:</span>
                                                        <span>{count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Outliers */}
                                <div className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Activity className={`h-5 w-5 ${stats.outliers.total > 0 ? "text-blue-500" : "text-green-500"}`} />
                                            <span className="font-medium">Outliers (IQR)</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {stats.outliers.total} detected
                                        </span>
                                    </div>
                                    {stats.outliers.total > 0 && (
                                        <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2 mt-2">
                                            {Object.entries(stats.outliers.by_column).map(([col, count]) => (
                                                <div key={col} className="flex justify-between">
                                                    <span>{col}:</span>
                                                    <span>{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    )
}

function Activity(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
