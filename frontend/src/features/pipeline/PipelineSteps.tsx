import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Check, Sparkles, Database, Activity, Split, ArrowRight, Filter } from "lucide-react"

export type PipelineStepId = "cleaning" | "missing" | "encoding" | "scaling" | "outliers" | "selection" | "engineering" | "split"

interface PipelineStep {
    id: PipelineStepId
    title: string
    description: string
    icon: any
}

const steps: PipelineStep[] = [
    { id: "cleaning", title: "Data Cleaning", description: "Fix formats & duplicates", icon: Sparkles },
    { id: "missing", title: "Missing Values", description: "Handle null values", icon: Database },
    { id: "outliers", title: "Outlier Detection", description: "Remove anomalies", icon: Activity },
    { id: "encoding", title: "Encoding", description: "Convert categories", icon: Activity },
    { id: "scaling", title: "Scaling", description: "Normalize features", icon: Activity },
    { id: "selection", title: "Feature Selection", description: "Select best features", icon: Filter },
    { id: "engineering", title: "Feature Engineering", description: "Create new features", icon: Sparkles },
    { id: "split", title: "Train/Test Split", description: "Prepare for modeling", icon: Split },
]

interface PipelineStepsProps {
    currentStep: PipelineStepId
    onStepChange: (step: PipelineStepId) => void
    completedSteps: PipelineStepId[]
}

export function PipelineSteps({ currentStep, onStepChange, completedSteps }: PipelineStepsProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Pipeline Steps</h3>
                <span className="text-xs text-muted-foreground">{completedSteps.length}/{steps.length} completed</span>
            </div>
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-border/50" />

                <div className="space-y-6 relative">
                    {steps.map((step, index) => {
                        const isActive = currentStep === step.id
                        const isCompleted = completedSteps.includes(step.id)

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "relative flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 group",
                                    isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50 border border-transparent"
                                )}
                                onClick={() => onStepChange(step.id)}
                            >
                                {/* Icon/Status Bubble */}
                                <div className={cn(
                                    "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                    isActive ? "border-primary bg-background text-primary" :
                                        isCompleted ? "border-primary bg-primary text-primary-foreground" : "border-muted bg-background text-muted-foreground"
                                )}>
                                    {isCompleted && !isActive ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                                </div>

                                <div className="flex-1 pt-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className={cn("font-medium", isActive && "text-primary")}>{step.title}</h4>
                                        {isActive && <ArrowRight className="h-4 w-4 text-primary animate-pulse" />}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
