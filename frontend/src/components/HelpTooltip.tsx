import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { tooltips, type TooltipKey } from "@/data/tooltips"
import { HelpCircle } from "lucide-react"

interface HelpTooltipProps {
    term: TooltipKey
    children?: React.ReactNode
}

export function HelpTooltip({ term, children }: HelpTooltipProps) {
    const content = tooltips[term]

    if (!content) return <>{children || term}</>

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    {children ? (
                        <span className="cursor-help underline decoration-dotted decoration-muted-foreground/50">
                            {children}
                        </span>
                    ) : (
                        <button className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                            <HelpCircle className="h-3.5 w-3.5" />
                        </button>
                    )}
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <p className="text-sm">{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

// Quick helper for inline terms
interface TermProps {
    tooltip: TooltipKey
    children: React.ReactNode
}

export function Term({ tooltip, children }: TermProps) {
    return (
        <HelpTooltip term={tooltip}>
            {children}
        </HelpTooltip>
    )
}
