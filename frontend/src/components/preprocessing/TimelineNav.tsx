import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { type PreprocessingStepData } from "@/data/preprocessingSteps"

interface TimelineNavProps {
    steps: PreprocessingStepData[]
    currentStepId: string
    completedSteps: Record<string, boolean>
    enabledSteps: Record<string, boolean>
    onStepSelect: (stepId: string) => void
}

export function TimelineNav({
    steps,
    currentStepId,
    completedSteps,
    enabledSteps,
    onStepSelect
}: TimelineNavProps) {
    return (
        <div className="relative flex flex-col gap-8 pl-4 py-4">
            {/* Vertical Line */}
            <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-border/50 -z-10" />

            {steps.map((step) => {
                const isCompleted = completedSteps[step.id]
                const isCurrent = currentStepId === step.id
                const isEnabled = enabledSteps[step.id]

                return (
                    <div
                        key={step.id}
                        className={cn(
                            "group flex items-start gap-4 cursor-pointer transition-all duration-200",
                            !isEnabled && "opacity-50 grayscale"
                        )}
                        onClick={() => onStepSelect(step.id)}
                    >
                        {/* Icon Node */}
                        <div className={cn(
                            "relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 z-10 bg-background",
                            isCurrent && "border-primary ring-4 ring-primary/20 scale-110",
                            isCompleted && isEnabled && "border-green-500 bg-green-500 text-white border-transparent",
                            !isEnabled && "border-muted-foreground/30 bg-muted/50",
                            !isCurrent && !isCompleted && isEnabled && "border-muted-foreground/30"
                        )}>
                            {isCompleted && isEnabled ? (
                                <Check className="h-3.5 w-3.5" />
                            ) : !isEnabled ? (
                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                            ) : (
                                <div className={cn(
                                    "h-2 w-2 rounded-full transition-colors",
                                    isCurrent ? "bg-primary" : "bg-transparent"
                                )} />
                            )}
                        </div>

                        {/* Label */}
                        <div className="flex flex-col pt-0.5">
                            <span className={cn(
                                "text-sm font-medium leading-none transition-colors",
                                isCurrent ? "text-primary" : "text-foreground",
                                !isEnabled && "text-muted-foreground line-through decoration-muted-foreground/50"
                            )}>
                                {step.title}
                            </span>
                            {isCurrent && (
                                <motion.span
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="text-xs text-muted-foreground mt-1.5 line-clamp-2"
                                >
                                    {step.description}
                                </motion.span>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
