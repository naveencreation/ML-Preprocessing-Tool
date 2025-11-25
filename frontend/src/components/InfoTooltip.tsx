import { type ReactNode } from "react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"

import type { PreprocessingExplanation } from "@/lib/preprocessing-explanations"

interface InfoTooltipProps {
    children?: ReactNode
    content?: PreprocessingExplanation
    className?: string
}

export default function InfoTooltip({ children, content, className = "" }: InfoTooltipProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-5 w-5 p-0 ml-2 ${className}`}
                >
                    <Info className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 max-h-[500px] overflow-y-auto" align="start">
                <div className="space-y-3">
                    {content ? (
                        <>
                            <ExplanationSection title="What it does">
                                {content.description}
                            </ExplanationSection>

                            <ExplanationSection title="When to use">
                                {content.whenToUse}
                            </ExplanationSection>

                            <ExplanationSection title="Pros">
                                <ProsList items={content.pros} />
                            </ExplanationSection>

                            <ExplanationSection title="Cons">
                                <ConsList items={content.cons} />
                            </ExplanationSection>
                        </>
                    ) : (
                        children
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

// Pre-built explanation sections
export function ExplanationSection({ title, children }: { title: string, children: ReactNode }) {
    return (
        <div>
            <h4 className="font-semibold text-sm mb-1">{title}</h4>
            <div className="text-sm text-muted-foreground">
                {children}
            </div>
        </div>
    )
}

export function ProsList({ items }: { items: string[] }) {
    return (
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {items.map((item, i) => (
                <li key={i} className="text-green-600 dark:text-green-400">
                    {item}
                </li>
            ))}
        </ul>
    )
}

export function ConsList({ items }: { items: string[] }) {
    return (
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {items.map((item, i) => (
                <li key={i} className="text-orange-600 dark:text-orange-400">
                    {item}
                </li>
            ))}
        </ul>
    )
}
