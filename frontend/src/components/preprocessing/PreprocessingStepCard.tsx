import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { ChevronDown, ChevronRight, Code2, Lightbulb, TrendingUp, Briefcase, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { type PreprocessingStepData } from "@/data/preprocessingSteps"
import { cn } from "@/lib/utils"

interface PreprocessingStepCardProps {
    step: PreprocessingStepData
    isEnabled: boolean
    onToggle: (enabled: boolean) => void
    parameters?: Record<string, any>
    onParameterChange?: (param: string, value: any) => void
}

export function PreprocessingStepCard({
    step,
    isEnabled,
    onToggle,
    parameters = {},
    onParameterChange
}: PreprocessingStepCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [showCode, setShowCode] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: step.order * 0.05 }}
        >
            <Card className={cn(
                "transition-all duration-200",
                isEnabled ? "border-primary/50 bg-primary/5" : "opacity-70"
            )}>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                            <div className="flex items-center gap-2 pt-1">
                                <Checkbox
                                    id={`step-${step.id}`}
                                    checked={isEnabled}
                                    onCheckedChange={onToggle}
                                />
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                    {step.order}
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <CardTitle className="text-lg">{step.title}</CardTitle>
                                    {isEnabled && (
                                        <Badge variant="default" className="text-xs">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Enabled
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription>{step.description}</CardDescription>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="shrink-0"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </CardHeader>

                {isExpanded && (
                    <CardContent className="space-y-6">
                        {/* Educational Content */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <div className="rounded-lg bg-purple-500/10 p-1.5">
                                        <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                                    </div>
                                    Why It Matters
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {step.whyItMatters}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <div className="rounded-lg bg-blue-500/10 p-1.5">
                                        <Lightbulb className="h-3.5 w-3.5 text-blue-500" />
                                    </div>
                                    When to Use
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {step.whenToUse}
                                </p>
                            </div>
                        </div>

                        {/* Industry Example */}
                        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                            <div className="flex items-start gap-2">
                                <Briefcase className="h-4 w-4 text-amber-600 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                        Industry Example
                                    </p>
                                    <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                                        {step.industryExample}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Parameters */}
                        {isEnabled && step.parameterOptions && step.parameterOptions.length > 0 && (
                            <div className="space-y-3 pt-2 border-t">
                                <h4 className="text-sm font-medium">Configuration</h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {step.parameterOptions.map((param) => (
                                        <div key={param.name} className="space-y-2">
                                            <Label htmlFor={`${step.id}-${param.name}`} className="text-sm">
                                                {param.description}
                                            </Label>
                                            {param.type === 'select' && (
                                                <Select
                                                    value={parameters[param.name] || param.default}
                                                    onValueChange={(value) => onParameterChange?.(param.name, value)}
                                                >
                                                    <SelectTrigger id={`${step.id}-${param.name}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {param.options?.map((option) => (
                                                            <SelectItem key={option} value={option}>
                                                                {option}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                            {param.type === 'number' && (
                                                <Input
                                                    id={`${step.id}-${param.name}`}
                                                    type="number"
                                                    value={parameters[param.name] || param.default}
                                                    onChange={(e) => onParameterChange?.(param.name, parseFloat(e.target.value))}
                                                    step="0.1"
                                                    min="0"
                                                    max="1"
                                                />
                                            )}
                                            {param.type === 'boolean' && (
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`${step.id}-${param.name}`}
                                                        checked={parameters[param.name] || param.default}
                                                        onCheckedChange={(checked) => onParameterChange?.(param.name, checked)}
                                                    />
                                                    <Label htmlFor={`${step.id}-${param.name}`} className="font-normal">
                                                        Enable this option
                                                    </Label>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Code Snippet */}
                        <div className="space-y-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowCode(!showCode)}
                                className="w-full"
                            >
                                <Code2 className="h-4 w-4 mr-2" />
                                {showCode ? 'Hide' : 'Show'} Python Code
                            </Button>
                            {showCode && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <pre className="rounded-lg bg-slate-950 p-4 overflow-x-auto text-xs">
                                        <code className="text-slate-50">{step.codeSnippet}</code>
                                    </pre>
                                </motion.div>
                            )}
                        </div>
                    </CardContent>
                )}
            </Card>
        </motion.div>
    )
}
