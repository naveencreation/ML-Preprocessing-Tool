import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataTypeCardProps {
    icon: LucideIcon
    title: string
    description: string
    fileTypes: string
    color: string
    bgColor: string
    steps?: string[]
    comingSoon?: boolean
    onClick?: () => void
    isSelected?: boolean
}

export function DataTypeCard({
    icon: Icon,
    title,
    description,
    fileTypes,
    color,
    bgColor,
    steps = [],
    comingSoon = false,
    onClick,
    isSelected = false
}: DataTypeCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <Card
                className={cn(
                    "h-full cursor-pointer border-border/50 transition-all duration-300 shadow-sm hover:shadow-lg relative overflow-hidden",
                    isSelected && "border-primary/50 shadow-md ring-2 ring-primary/20",
                    !comingSoon && "hover:border-primary/30",
                    comingSoon && "opacity-70"
                )}
                onClick={!comingSoon ? onClick : undefined}
            >
                {comingSoon && (
                    <div className="absolute top-3 right-3 z-10">
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30">
                            Coming Soon
                        </Badge>
                    </div>
                )}

                <CardHeader>
                    <div className={cn("mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl", bgColor)}>
                        <Icon className={cn("h-8 w-8", color)} />
                    </div>
                    <CardTitle className="text-xl flex items-center gap-2">
                        {title}
                        {isSelected && (
                            <Badge variant="default" className="text-xs">
                                Selected
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                        {description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Supported Formats</p>
                        <Badge variant="outline" className="text-xs font-mono">
                            {fileTypes}
                        </Badge>
                    </div>

                    {steps.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                Preprocessing Steps Available
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {steps.slice(0, 3).map((step) => (
                                    <Badge key={step} variant="secondary" className="text-xs">
                                        {step}
                                    </Badge>
                                ))}
                                {steps.length > 3 && (
                                    <Badge variant="secondary" className="text-xs font-semibold">
                                        +{steps.length - 3} more
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>

                {/* Subtle glow effect on hover */}
                <div className={cn(
                    "absolute inset-0 opacity-0 hover:opacity-5 transition-opacity pointer-events-none",
                    bgColor
                )} />
            </Card>
        </motion.div>
    )
}
