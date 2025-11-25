import { type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    action?: {
        label: string
        onClick: () => void
    }
    className?: string
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className = "",
}: EmptyStateProps) {
    return (
        <div
            className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
        >
            <div className="rounded-full bg-muted/50 p-6 mb-4">
                <Icon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-md mb-6">{description}</p>
            {action && (
                <Button onClick={action.onClick} size="lg">
                    {action.label}
                </Button>
            )}
        </div>
    )
}
