import { type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface BreadcrumbItem {
    label: string
    href: string
}

interface PageHeaderProps {
    title: string
    description?: string
    actions?: ReactNode
    showBack?: boolean
    backPath?: string
    breadcrumbs?: BreadcrumbItem[]
}

export default function PageHeader({
    title,
    description,
    actions,
    showBack = false,
    backPath,
    breadcrumbs,
}: PageHeaderProps) {
    const navigate = useNavigate()

    const handleBack = () => {
        if (backPath) {
            navigate(backPath)
        } else {
            navigate(-1)
        }
    }

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="space-y-2">
                {breadcrumbs && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {breadcrumbs.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {index > 0 && <span>/</span>}
                                <a href={item.href} className="hover:text-foreground transition-colors">
                                    {item.label}
                                </a>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-4">
                    {showBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBack}
                            className="shrink-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                        {description && (
                            <p className="text-muted-foreground mt-1">{description}</p>
                        )}
                    </div>
                </div>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    )
}
