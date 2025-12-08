import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import PageHeader from "@/components/PageHeader"
import { TemplateManager } from "@/components/preprocessing/TemplateManager"
import { SaveTemplateDialog } from "@/components/preprocessing/SaveTemplateDialog"
import { PreprocessingStepsSkeleton, DatasetInfoSkeleton } from "@/components/preprocessing/LoadingSkeletons"
import { TimelineNav } from "@/components/preprocessing/TimelineNav"
import { StepWorkspace } from "@/components/preprocessing/StepWorkspace"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { applyPreprocessing, generatePreprocessingCode, getDatasetPreview } from "@/lib/api"
import { preprocessingSteps } from "@/data/preprocessingSteps"
import { mapStepsToApiOptions } from "@/lib/preprocessing-utils"
import type { PreprocessingTemplate } from "@/lib/templates"
import { Play, FileCode, Loader2, Brain } from "lucide-react"

export default function DatasetPreprocessingFlow() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()

    const [datasetInfo, setDatasetInfo] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isGeneratingCode, setIsGeneratingCode] = useState(false)

    // Timeline State
    const [activeStepId, setActiveStepId] = useState<string>('missing_values')

    // Step enablement state
    const [enabledSteps, setEnabledSteps] = useState<Record<string, boolean>>({
        missing_values: true,
        encoding: true,
        scaling: true,
        outliers: false,
        feature_selection: false,
        train_test_split: true
    })

    // Parameters for each step
    const [stepParameters, setStepParameters] = useState<Record<string, Record<string, any>>>({
        missing_values: { strategy: 'Fill with Mean' },
        encoding: { method: 'One-Hot Encoding' },
        scaling: { method: 'StandardScaler' },
        outliers: { method: 'None' },
        feature_selection: { remove_high_correlation: false, low_variance_filtering: false },
        train_test_split: { test_size: 0.2, stratify: false }
    })

    const steps = preprocessingSteps.dataset

    useEffect(() => {
        loadDatasetInfo()
    }, [id])

    const loadDatasetInfo = async () => {
        try {
            const preview = await getDatasetPreview(parseInt(id!))
            setDatasetInfo(preview)
        } catch (error) {
            toast({
                title: "Error loading dataset",
                description: "Failed to load dataset information",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleStep = (stepId: string, enabled: boolean) => {
        setEnabledSteps(prev => ({ ...prev, [stepId]: enabled }))
    }

    const handleParameterChange = (stepId: string, param: string, value: any) => {
        setStepParameters(prev => ({
            ...prev,
            [stepId]: {
                ...prev[stepId],
                [param]: value
            }
        }))
    }

    const handleApplyPreprocessing = async () => {
        setIsProcessing(true)
        try {
            // Build options from enabled steps and parameters
            const options = mapStepsToApiOptions('dataset', steps, enabledSteps, stepParameters)

            const result = await applyPreprocessing(parseInt(id!), options)

            toast({
                title: "Preprocessing complete!",
                description: "Your data has been processed successfully",
            })

            // Navigate to comparison view
            navigate(`/comparison/${result.id}`)
        } catch (error) {
            toast({
                title: "Preprocessing failed",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const handleGenerateCode = async () => {
        setIsGeneratingCode(true)
        try {
            const options = mapStepsToApiOptions('dataset', steps, enabledSteps, stepParameters)
            const code = await generatePreprocessingCode(parseInt(id!), options, 'detailed')

            // Download code as .py file
            const blob = new Blob([code.code], { type: 'text/plain' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'preprocessing_code.py'
            a.click()
            window.URL.revokeObjectURL(url)

            toast({
                title: "Code generated!",
                description: "Python script has been downloaded",
            })
        } catch (error) {
            toast({
                title: "Code generation failed",
                description: "Failed to generate code",
                variant: "destructive",
            })
        } finally {
            setIsGeneratingCode(false)
        }
    }

    const enabledCount = Object.values(enabledSteps).filter(Boolean).length

    const handleLoadTemplate = (template: PreprocessingTemplate) => {
        // Convert template to state format
        const newEnabledSteps: Record<string, boolean> = {}
        const newStepParameters: Record<string, Record<string, any>> = {}

        template.steps.forEach(step => {
            newEnabledSteps[step.stepId] = step.enabled
            newStepParameters[step.stepId] = step.parameters
        })

        setEnabledSteps(newEnabledSteps)
        setStepParameters(newStepParameters)
    }

    // Navigation Helpers
    const currentStepIndex = steps.findIndex(s => s.id === activeStepId)
    const activeStep = steps[currentStepIndex]

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setActiveStepId(steps[currentStepIndex + 1].id)
        }
    }

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setActiveStepId(steps[currentStepIndex - 1].id)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-8">
                <PageHeader
                    title="Dataset Preprocessing"
                    description="Configure step-by-step preprocessing for your tabular data"
                    showBack
                    backPath="/datasets"
                />
                <DatasetInfoSkeleton />
                <PreprocessingStepsSkeleton />
            </div>
        )
    }

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <PageHeader
                    title="Dataset Preprocessing"
                    description="Configure your pipeline step-by-step"
                    showBack
                    backPath="/datasets"
                />
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/intelligence/${id}`)}
                        className="gap-2 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/50 dark:border-purple-800 dark:text-purple-300"
                    >
                        <Brain className="h-4 w-4" />
                        AI Intelligence
                    </Button>
                    <TemplateManager
                        dataType="dataset"
                        onLoadTemplate={handleLoadTemplate}
                    />
                    <SaveTemplateDialog
                        dataType="dataset"
                        currentConfig={{ enabledSteps, stepParameters }}
                    />
                    <Button
                        variant="outline"
                        onClick={handleGenerateCode}
                        disabled={isGeneratingCode || enabledCount === 0}
                    >
                        {isGeneratingCode ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <FileCode className="h-4 w-4 mr-2" />
                        )}
                        Generate Code
                    </Button>
                    <Button
                        onClick={handleApplyPreprocessing}
                        disabled={isProcessing || enabledCount === 0}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20"
                    >
                        {isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Play className="h-4 w-4 mr-2" />
                        )}
                        Run Pipeline
                    </Button>
                </div>
            </div>

            {/* Main Split View */}
            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                {/* Left Panel: Timeline Navigation */}
                <Card className="col-span-3 h-full overflow-y-auto border-r bg-muted/10">
                    <CardContent className="p-0">
                        <div className="p-4 border-b bg-background/50 backdrop-blur sticky top-0 z-10">
                            <h3 className="font-semibold">Pipeline Steps</h3>
                            <p className="text-xs text-muted-foreground">
                                {enabledCount} of {steps.length} steps enabled
                            </p>
                        </div>
                        <TimelineNav
                            steps={steps}
                            currentStepId={activeStepId}
                            completedSteps={enabledSteps} // Using enabled as "completed" for now, logic can be refined
                            enabledSteps={enabledSteps}
                            onStepSelect={setActiveStepId}
                        />
                    </CardContent>
                </Card>

                {/* Right Panel: Active Step Workspace */}
                <div className="col-span-9 h-full flex flex-col gap-4">
                    {/* Dataset Info Bar */}
                    {datasetInfo && (
                        <Card className="shrink-0 bg-primary/5 border-primary/10">
                            <CardContent className="py-3 px-4 flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="font-medium">{datasetInfo.filename}</span>
                                    <span className="text-muted-foreground">|</span>
                                    <span className="text-muted-foreground">{datasetInfo.total_rows?.toLocaleString()} rows</span>
                                    <span className="text-muted-foreground">|</span>
                                    <span className="text-muted-foreground">{datasetInfo.columns?.length} columns</span>
                                </div>
                                <Badge variant="outline" className="bg-background">Tabular Data</Badge>
                            </CardContent>
                        </Card>
                    )}

                    {/* Workspace */}
                    <div className="flex-1 min-h-0">
                        <StepWorkspace
                            step={activeStep}
                            isEnabled={enabledSteps[activeStep.id]}
                            onToggle={(enabled) => handleToggleStep(activeStep.id, enabled)}
                            parameters={stepParameters[activeStep.id]}
                            onParameterChange={(param, value) => handleParameterChange(activeStep.id, param, value)}
                            onNext={handleNext}
                            onPrev={handlePrev}
                            isFirst={currentStepIndex === 0}
                            isLast={currentStepIndex === steps.length - 1}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
