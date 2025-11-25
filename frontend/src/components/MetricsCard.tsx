import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface MetricsCardProps {
    title: string
    value: string | number
    description?: string
    icon?: LucideIcon
    trend?: {
        value: number
        label: string
        positive: boolean
    }
    className?: string
    iconColor?: string
}

export default function MetricsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className = "",
    iconColor = "text-primary",
}: MetricsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <Card className={className}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    {Icon && (
                        <div className={`rounded-lg bg-primary/10 p-2 ${iconColor}`}>
                            <Icon className="h-4 w-4" />
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{value}</div>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    )}
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <span
                                className={`text-sm font-medium ${trend.positive ? "text-green-600" : "text-red-600"
                                    }`}
                            >
                                {trend.positive ? "+" : ""}
                                {trend.value}%
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {trend.label}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
