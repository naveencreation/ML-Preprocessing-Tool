import { useState, useEffect } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Clock, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAllLogs } from "@/lib/api"
import { format } from "date-fns"
import EmptyState from "@/components/EmptyState"

export default function Logs() {
    const { toast } = useToast()
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadLogs()
    }, [])

    const loadLogs = async () => {
        try {
            setLoading(true)
            const data = await getAllLogs()
            setLogs(data)
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to load activity logs",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            <PageHeader
                title="Activity Logs"
                description="History of all preprocessing operations and system events"
            />

            <Card className="flex-1 overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="border-b bg-muted/20 pb-4">
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <CardTitle>System Activity</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0 h-full">
                    <ScrollArea className="h-full">
                        {loading ? (
                            <div className="p-8 space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="h-12 w-12 rounded-full bg-muted/20 animate-pulse" />
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 w-1/3 bg-muted/20 rounded animate-pulse" />
                                            <div className="h-4 w-1/2 bg-muted/20 rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : logs.length > 0 ? (
                            <div className="relative p-6">
                                {/* Timeline Line */}
                                <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-border" />

                                <div className="space-y-8">
                                    {logs.map((log) => (
                                        <div key={log.id} className="relative flex gap-6 group">
                                            {/* Icon Bubble */}
                                            <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background ring-4 ring-background group-hover:border-primary group-hover:text-primary transition-colors">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>

                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                                        {log.action.replace(/_/g, ' ').toUpperCase()}
                                                        <Badge variant="outline" className="font-normal text-xs">
                                                            ID: {log.id}
                                                        </Badge>
                                                    </h4>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {format(new Date(log.created_at), "PP p")}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Processed dataset ID <span className="font-mono text-foreground">{log.dataset_id}</span>
                                                </p>

                                                {log.parameters && (
                                                    <div className="mt-2 rounded-md bg-muted/50 p-3 text-xs font-mono overflow-x-auto">
                                                        <pre>{JSON.stringify(log.parameters, null, 2)}</pre>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-12">
                                <EmptyState
                                    icon={Activity}
                                    title="No Activity Yet"
                                    description="Start processing datasets to see activity logs here."
                                />
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
