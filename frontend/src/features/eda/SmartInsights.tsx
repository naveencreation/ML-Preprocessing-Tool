import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, AlertTriangle, Info, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { getSmartInsights } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface SmartInsightsProps {
    datasetId: number
}

import type { LucideIcon } from "lucide-react"

interface Insight {
    type: string
    title: string
    description: string
    action?: string
}

const iconMap: Record<string, LucideIcon> = {
    warning: AlertTriangle,
    success: CheckCircle2,
    info: Info,
    tip: Lightbulb
}

const colorMap: Record<string, { text: string, bg: string, border: string }> = {
    warning: { text: "text-amber-500", bg: "bg-amber-500/10", border: "#f59e0b" },
    success: { text: "text-green-500", bg: "bg-green-500/10", border: "#22c55e" },
    info: { text: "text-blue-500", bg: "bg-blue-500/10", border: "#3b82f6" },
    tip: { text: "text-purple-500", bg: "bg-purple-500/10", border: "#a855f7" }
}

export function SmartInsights({ datasetId }: SmartInsightsProps) {
    const [insights, setInsights] = useState<Insight[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadInsights()
    }, [datasetId])

    const loadInsights = async () => {
        try {
            setLoading(true)
            const data = await getSmartInsights(datasetId)
            setInsights(data.insights || [])
        } catch (error) {
            console.error("Failed to load insights", error)
            // Fallback to empty array
            setInsights([])
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (insights.length === 0) {
        return null
    }

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {insights.slice(0, 6).map((insight, index) => {
                const Icon = iconMap[insight.type] || Info
                const colors = colorMap[insight.type] || colorMap.info

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card
                            className="h-full hover:shadow-md transition-shadow border-l-4"
                            style={{ borderLeftColor: colors.border }}
                        >
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className={`p-2 rounded-lg ${colors.bg}`}>
                                    <Icon className={`h-5 w-5 ${colors.text}`} />
                                </div>
                                <CardTitle className="text-base">{insight.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{insight.description}</p>
                                {insight.action && (
                                    <p className="text-xs text-primary mt-2 flex items-start gap-1">
                                        <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                                        <span>{insight.action}</span>
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )
            })}
        </div>
    )
}
