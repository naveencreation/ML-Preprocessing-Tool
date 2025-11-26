import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react"

interface DataPreviewProps {
    beforeData?: any[]
    afterData?: any[]
    beforeStats?: {
        totalRows: number
        totalColumns: number
        missingValues: number
        duplicates: number
        outliers: number
    }
    afterStats?: {
        totalRows: number
        totalColumns: number
        missingValues: number
        duplicates: number
        outliers: number
    }
}

export function DataPreview({ beforeData, afterData, beforeStats, afterStats }: DataPreviewProps) {
    const hasData = beforeData && beforeData.length > 0

    if (!hasData) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground py-8">
                        <p>Preview will be available after preprocessing</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const columns = Object.keys(beforeData[0] || {})
    const previewRows = 10

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Data Preview
                    {afterData && (
                        <Badge variant="secondary" className="ml-2">
                            Before/After Comparison
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={afterData ? "comparison" : "before"} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="before">Before</TabsTrigger>
                        {afterData && <TabsTrigger value="after">After</TabsTrigger>}
                        {afterData && <TabsTrigger value="comparison">Side-by-Side</TabsTrigger>}
                    </TabsList>

                    {/* Stats Summary */}
                    {(beforeStats || afterStats) && (
                        <div className="grid grid-cols-2 gap-4 my-4">
                            {beforeStats && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Before Processing</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <StatItem
                                            label="Rows"
                                            value={beforeStats.totalRows.toLocaleString()}
                                        />
                                        <StatItem
                                            label="Columns"
                                            value={beforeStats.totalColumns}
                                        />
                                        <StatItem
                                            label="Missing"
                                            value={beforeStats.missingValues}
                                            variant={beforeStats.missingValues > 0 ? "warning" : "success"}
                                        />
                                        <StatItem
                                            label="Duplicates"
                                            value={beforeStats.duplicates}
                                            variant={beforeStats.duplicates > 0 ? "warning" : "success"}
                                        />
                                    </div>
                                </div>
                            )}
                            {afterStats && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">After Processing</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <StatItem
                                            label="Rows"
                                            value={afterStats.totalRows.toLocaleString()}
                                        />
                                        <StatItem
                                            label="Columns"
                                            value={afterStats.totalColumns}
                                        />
                                        <StatItem
                                            label="Missing"
                                            value={afterStats.missingValues}
                                            variant={afterStats.missingValues > 0 ? "warning" : "success"}
                                            showTrend
                                            previousValue={beforeStats?.missingValues}
                                        />
                                        <StatItem
                                            label="Duplicates"
                                            value={afterStats.duplicates}
                                            variant={afterStats.duplicates > 0 ? "warning" : "success"}
                                            showTrend
                                            previousValue={beforeStats?.duplicates}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <TabsContent value="before" className="mt-4">
                        <DataTable data={beforeData.slice(0, previewRows)} columns={columns} />
                    </TabsContent>

                    {afterData && (
                        <TabsContent value="after" className="mt-4">
                            <DataTable
                                data={afterData.slice(0, previewRows)}
                                columns={Object.keys(afterData[0] || {})}
                            />
                        </TabsContent>
                    )}

                    {afterData && (
                        <TabsContent value="comparison" className="mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Before</h4>
                                    <DataTable data={beforeData.slice(0, previewRows)} columns={columns} compact />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium mb-2">After</h4>
                                    <DataTable
                                        data={afterData.slice(0, previewRows)}
                                        columns={Object.keys(afterData[0] || {})}
                                        compact
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </CardContent>
        </Card>
    )
}

function DataTable({ data, columns, compact = false }: { data: any[]; columns: string[]; compact?: boolean }) {
    return (
        <ScrollArea className={compact ? "h-[300px]" : "h-[400px]"}>
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead key={col} className={compact ? "text-xs" : ""}>
                                {col}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row, i) => (
                        <TableRow key={i}>
                            {columns.map((col) => (
                                <TableCell key={col} className={compact ? "text-xs py-1" : ""}>
                                    {row[col]?.toString() || "-"}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
    )
}

function StatItem({
    label,
    value,
    variant = "default",
    showTrend = false,
    previousValue,
}: {
    label: string
    value: number | string
    variant?: "default" | "success" | "warning"
    showTrend?: boolean
    previousValue?: number
}) {
    const improved = showTrend && previousValue !== undefined && Number(value) < previousValue

    return (
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <span className="text-muted-foreground">{label}</span>
            <div className="flex items-center gap-1">
                <span
                    className={
                        variant === "warning"
                            ? "text-amber-600 font-medium"
                            : variant === "success"
                                ? "text-green-600 font-medium"
                                : "font-medium"
                    }
                >
                    {value}
                </span>
                {showTrend && previousValue !== undefined && (
                    <>
                        {improved ? (
                            <TrendingDown className="h-3 w-3 text-green-600" />
                        ) : Number(value) > previousValue ? (
                            <TrendingUp className="h-3 w-3 text-red-600" />
                        ) : null}
                    </>
                )}
            </div>
        </div>
    )
}
