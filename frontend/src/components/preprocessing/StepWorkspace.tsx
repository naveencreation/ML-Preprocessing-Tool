import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Lightbulb,
    TrendingUp,
    Briefcase,
    Code2,
    ChevronRight,
    ChevronLeft,
    XCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { type PreprocessingStepData } from "@/data/preprocessingSteps"


interface StepWorkspaceProps {
    step: PreprocessingStepData
    isEnabled: boolean
    onToggle: (enabled: boolean) => void
    parameters: Record<string, any>
    onParameterChange: (param: string, value: any) => void
    onNext?: () => void
    onPrev?: () => void
    isFirst: boolean
    isLast: boolean
}

export function StepWorkspace({
    step,
    isEnabled,
    onToggle,
    parameters = {},
    onParameterChange,
    onNext,
    onPrev,
    isFirst,
    isLast
}: StepWorkspaceProps) {
    const [showCode, setShowCode] = useState(false)

    return (
        <div className="h-full flex flex-col">
            {/* Header Area */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-semibold tracking-tight">{step.title}</h2>
                        <Badge variant={isEnabled ? "default" : "secondary"} className="text-xs">
                            {isEnabled ? "Enabled" : "Skipped"}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground max-w-2xl">
                        {step.description}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="step-toggle" className="text-sm font-medium text-muted-foreground">
                        {isEnabled ? "Step Enabled" : "Step Disabled"}
                    </Label>
                    <Switch
                        id="step-toggle"
                        checked={isEnabled}
                        onCheckedChange={onToggle}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 grid gap-6 lg:grid-cols-3 min-h-0">
                {/* Left Column: Configuration */}
                <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2">
                    <AnimatePresence mode="wait">
                        {isEnabled ? (
                            <motion.div
                                key="enabled"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                {/* Parameters Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Configuration</CardTitle>
                                        <CardDescription>Customize how this step is applied</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-6">
                                        {step.parameterOptions?.map((param) => (
                                            <div key={param.name} className="space-y-2">
                                                <Label className="text-sm font-medium">
                                                    {param.description}
                                                </Label>

                                                {param.type === 'select' && (
                                                    <Select
                                                        value={parameters[param.name] || param.default}
                                                        onValueChange={(value) => onParameterChange(param.name, value)}
                                                    >
                                                        <SelectTrigger>
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
                                                        type="number"
                                                        value={parameters[param.name] || param.default}
                                                        onChange={(e) => onParameterChange(param.name, parseFloat(e.target.value))}
                                                        step="0.1"
                                                    />
                                                )}

                                                {param.type === 'boolean' && (
                                                    <div className="flex items-center gap-2 pt-1">
                                                        <Checkbox
                                                            id={param.name}
                                                            checked={parameters[param.name] || param.default}
                                                            onCheckedChange={(checked) => onParameterChange(param.name, checked)}
                                                        />
                                                        <Label htmlFor={param.name} className="font-normal text-muted-foreground">
                                                            Enable this option
                                                        </Label>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {(!step.parameterOptions || step.parameterOptions.length === 0) && (
                                            <div className="flex items-center justify-center h-20 text-muted-foreground text-sm italic border-2 border-dashed rounded-lg">
                                                No configuration needed for this step
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Code Preview */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Code2 className="h-4 w-4 text-primary" />
                                                Code Preview
                                            </CardTitle>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowCode(!showCode)}
                                            >
                                                {showCode ? "Hide" : "Show"}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    {showCode && (
                                        <CardContent>
                                            <pre className="rounded-lg bg-slate-950 p-4 overflow-x-auto text-xs">
                                                <code className="text-slate-50">{step.codeSnippet}</code>
                                            </pre>
                                        </CardContent>
                                    )}
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="disabled"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center h-[300px] text-center p-8 border-2 border-dashed rounded-xl bg-muted/30"
                            >
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <XCircle className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">Step Skipped</h3>
                                <p className="text-muted-foreground max-w-sm mb-6">
                                    This step will not be applied to your data. Enable it to configure parameters.
                                </p>
                                <Button variant="outline" onClick={() => onToggle(true)}>
                                    Enable Step
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column: Educational Context */}
                <div className="space-y-4">
                    <Card className="bg-blue-500/5 border-blue-500/20">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                                <Lightbulb className="h-4 w-4" />
                                Why It Matters
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {step.whyItMatters}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-purple-500/5 border-purple-500/20">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                                <TrendingUp className="h-4 w-4" />
                                When to Use
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {step.whenToUse}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-amber-500/5 border-amber-500/20">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                                <Briefcase className="h-4 w-4" />
                                Industry Example
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {step.industryExample}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t">
                <Button
                    variant="ghost"
                    onClick={onPrev}
                    disabled={isFirst}
                    className="gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous Step
                </Button>

                <div className="flex gap-2">
                    {!isLast && (
                        <Button onClick={onNext} className="gap-2">
                            Next Step
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
