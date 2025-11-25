import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ReactNode } from "react"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface ChartCardProps {
    title: string
    description?: string
    children: ReactNode
    loading?: boolean
    error?: string | null
    actions?: ReactNode
    className?: string
}

export default function ChartCard({
    title,
    description,
    children,
    loading = false,
    error = null,
    actions,
    className = "",
}: ChartCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={className}>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>{title}</CardTitle>
                            {description && <CardDescription>{description}</CardDescription>}
                        </div>
                        {actions && <div className="flex gap-2">{actions}</div>}
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-64 w-full" />
                            <div className="flex gap-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-64 text-destructive">
                            <p>{error}</p>
                        </div>
                    ) : (
                        children
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
