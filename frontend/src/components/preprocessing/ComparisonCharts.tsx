import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react"

interface ComparisonData {
    before: {
        missingByColumn?: Record<string, number>
        outliers?: number
        duplicates?: number
        totalRows: number
        totalColumns: number
    }
    after: {
        missingByColumn?: Record<string, number>
        outliers?: number
        duplicates?: number
        totalRows: number
        totalColumns: number
    }
}

export function ComparisonCharts({ data }: { data: ComparisonData }) {
    const qualityScoreBefore = calculateQualityScore(data.before)
    const qualityScoreAfter = calculateQualityScore(data.after)
    const improvement = qualityScoreAfter - qualityScoreBefore

    // Prepare missing values chart data
    const missingValuesData = prepareMissingValuesData(data)

    // Prepare metrics comparison data
    const metricsData = [
        {
            metric: "Missing Values",
            before: Object.values(data.before.missingByColumn || {}).reduce((sum, val) => sum + val, 0),
            after: Object.values(data.after.missingByColumn || {}).reduce((sum, val) => sum + val, 0),
        },
        {
            metric: "Outliers",
            before: data.before.outliers || 0,
            after: data.after.outliers || 0,
        },
        {
            metric: "Duplicates",
            before: data.before.duplicates || 0,
            after: data.after.duplicates || 0,
        },
    ]

    return (
        <div className="space-y-6">
            {/* Data Quality Score */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Data Quality Score
                        {improvement > 0 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                        )}
                    </CardTitle>
                    <CardDescription>
                        Overall data health based on missing values, outliers, and duplicates
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Before Processing</span>
                                <span className="text-2xl font-bold">{qualityScoreBefore}%</span>
                            </div>
                            <Progress value={qualityScoreBefore} className="h-3" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">After Processing</span>
                                <span className="text-2xl font-bold text-green-600">{qualityScoreAfter}%</span>
                            </div>
                            <Progress value={qualityScoreAfter} className="h-3 [&>div]:bg-green-600" />
                        </div>
                    </div>
                    {improvement > 0 && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <span>Quality improved by {improvement.toFixed(1)}%</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Issues Comparison */}
            <Card>
                <CardHeader>
                    <CardTitle>Data Issues Comparison</CardTitle>
                    <CardDescription>
                        Count of data quality issues before and after preprocessing
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={metricsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="metric" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="before" fill="#ef4444" name="Before" />
                            <Bar dataKey="after" fill="#22c55e" name="After" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Missing Values by Column */}
            {missingValuesData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Missing Values by Column</CardTitle>
                        <CardDescription>
                            Distribution of missing values across columns
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={missingValuesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="column" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="before" fill="#ef4444" name="Before" />
                                <Bar dataKey="after" fill="#22c55e" name="After" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <MetricCard
                    title="Rows Processed"
                    before={data.before.totalRows}
                    after={data.after.totalRows}
                    unit="rows"
                />
                <MetricCard
                    title="Columns"
                    before={data.before.totalColumns}
                    after={data.after.totalColumns}
                    unit="columns"
                />
                <MetricCard
                    title="Total Issues Resolved"
                    value={calculateIssuesResolved(data)}
                    isImprovement
                />
            </div>
        </div>
    )
}

function MetricCard({
    title,
    before,
    after,
    value,
    unit = "",
    isImprovement = false,
}: {
    title: string
    before?: number
    after?: number
    value?: number
    unit?: string
    isImprovement?: boolean
}) {
    const displayValue = value ?? after ?? 0
    const hasChange = before !== undefined && after !== undefined && before !== after
    const improved = hasChange && after < before

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                        {displayValue.toLocaleString()}
                        {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
                    </div>
                    {(isImprovement || hasChange) && (
                        <div className="flex items-center gap-1">
                            {improved || isImprovement ? (
                                <>
                                    <TrendingDown className="h-4 w-4 text-green-600" />
                                    {hasChange && (
                                        <span className="text-xs text-green-600">
                                            -{((before! - after!) / before! * 100).toFixed(0)}%
                                        </span>
                                    )}
                                </>
                            ) : hasChange && after > before ? (
                                <>
                                    <TrendingUp className="h-4 w-4 text-amber-600" />
                                    <span className="text-xs text-amber-600">
                                        +{((after - before) / before * 100).toFixed(0)}%
                                    </span>
                                </>
                            ) : null}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function calculateQualityScore(data: { missingByColumn?: Record<string, number>; outliers?: number; duplicates?: number; totalRows: number; totalColumns: number }): number {
    const totalCells = data.totalRows * data.totalColumns
    const missingCount = Object.values(data.missingByColumn || {}).reduce((sum, val) => sum + val, 0)
    const missingPercent = totalCells > 0 ? (missingCount / totalCells) * 100 : 0
    const outlierPercent = data.totalRows > 0 ? ((data.outliers || 0) / data.totalRows) * 100 : 0
    const duplicatePercent = data.totalRows > 0 ? ((data.duplicates || 0) / data.totalRows) * 100 : 0

    const score = 100 - (missingPercent + outlierPercent + duplicatePercent)
    return Math.max(0, Math.min(100, Math.round(score)))
}

function prepareMissingValuesData(data: ComparisonData) {
    const allColumns = new Set([
        ...Object.keys(data.before.missingByColumn || {}),
        ...Object.keys(data.after.missingByColumn || {}),
    ])

    return Array.from(allColumns).map((column) => ({
        column,
        before: data.before.missingByColumn?.[column] || 0,
        after: data.after.missingByColumn?.[column] || 0,
    })).filter(item => item.before > 0 || item.after > 0)
}

function calculateIssuesResolved(data: ComparisonData): number {
    const beforeIssues =
        Object.values(data.before.missingByColumn || {}).reduce((sum, val) => sum + val, 0) +
        (data.before.outliers || 0) +
        (data.before.duplicates || 0)

    const afterIssues =
        Object.values(data.after.missingByColumn || {}).reduce((sum, val) => sum + val, 0) +
        (data.after.outliers || 0) +
        (data.after.duplicates || 0)

    return Math.max(0, beforeIssues - afterIssues)
}
