import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Code2, Table as TableIcon, RefreshCw } from "lucide-react"
import CodeBlock from "@/components/CodeBlock"
import { ScrollArea } from "@/components/ui/scroll-area"

interface StepPreviewProps {
    code: string | null
    onGenerateCode: () => void
    previewData?: any[]
}

export function StepPreview({ code, onGenerateCode, previewData }: StepPreviewProps) {
    return (
        <div className="h-full flex flex-col space-y-4">
            <Card className="flex-1 flex flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="py-3 px-4 border-b bg-muted/20">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Code2 className="h-4 w-4" />
                            Live Preview
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={onGenerateCode} className="h-7 text-xs gap-1">
                            <RefreshCw className="h-3 w-3" />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                    <Tabs defaultValue="code" className="h-full flex flex-col">
                        <div className="px-4 pt-2 border-b bg-muted/10">
                            <TabsList className="h-8 w-auto bg-transparent p-0">
                                <TabsTrigger
                                    value="code"
                                    className="h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 text-xs"
                                >
                                    Python Code
                                </TabsTrigger>
                                <TabsTrigger
                                    value="data"
                                    className="h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 text-xs"
                                >
                                    Data Preview
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="code" className="flex-1 mt-0 overflow-hidden relative group">
                            <ScrollArea className="h-full">
                                {code ? (
                                    <CodeBlock code={code} language="python" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                        <Code2 className="h-8 w-8 mb-2 opacity-50" />
                                        <p className="text-sm">Configure steps to generate code</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="data" className="flex-1 mt-0 p-4 overflow-auto">
                            {previewData && previewData.length > 0 ? (
                                <div className="rounded-md border">
                                    <table className="w-full text-xs">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                {Object.keys(previewData[0]).map((key) => (
                                                    <th key={key} className="p-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                                                        {key}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.slice(0, 10).map((row: Record<string, unknown>, i: number) => (
                                                <tr key={i} className="border-t hover:bg-muted/20">
                                                    {Object.values(row).map((val: unknown, j: number) => (
                                                        <td key={j} className="p-2 whitespace-nowrap">
                                                            {String(val)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                    <TableIcon className="h-8 w-8 mb-2 opacity-50" />
                                    <p className="text-sm">No preview data available</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
