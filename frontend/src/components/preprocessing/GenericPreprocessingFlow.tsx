// Generic preprocessing flow component that works for all data types
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import PageHeader from "@/components/PageHeader"
import { PreprocessingStepCard } from "@/components/preprocessing/PreprocessingStepCard"
import { TemplateManager } from "@/components/preprocessing/TemplateManager"
import { SaveTemplateDialog } from "@/components/preprocessing/SaveTemplateDialog"
import { PreprocessingStepsSkeleton, DatasetInfoSkeleton } from "@/components/preprocessing/LoadingSkeletons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { applyPreprocessing, generatePreprocessingCode, getDatasetPreview } from "@/lib/api"
import { type PreprocessingStepData } from "@/data/preprocessingSteps"
import { mapStepsToApiOptions } from "@/lib/preprocessing-utils"
import type { PreprocessingTemplate } from "@/lib/templates"
import { motion } from "framer-motion"
import { Play, FileCode, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface GenericPreprocessingFlowProps {
    dataType: 'text' | 'image' | 'audio' | 'logs'
    steps: PreprocessingStepData[]
    title: string
    description: string
    badgeLabel: string
}

export default function GenericPreprocessingFlow({
    dataType,
    steps,
    title,
    description,
    badgeLabel
}: GenericPreprocessingFlowProps) {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()

    const [datasetInfo, setDatasetInfo] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isGeneratingCode, setIsGeneratingCode] = useState(false)

    // Step enablement state - dynamically initialize based on steps
    const [enabledSteps, setEnabledSteps] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {}
        steps.forEach(step => {
            // Enable first 2-3 steps by default
            initial[step.id] = step.order <= 2
        })
        return initial
    })

    // Parameters for each step
    const [stepParameters, setStepParameters] = useState<Record<string, Record<string, any>>>(() => {
        const initial: Record<string, Record<string, any>> = {}
        steps.forEach(step => {
            const params: Record<string, any> = {}
            step.parameterOptions?.forEach(param => {
                params[param.name] = param.default
            })
            initial[step.id] = params
        })
        return initial
    })

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

    const buildOptions = () => {
        return mapStepsToApiOptions(dataType, steps, enabledSteps, stepParameters)
    }

    const handleApplyPreprocessing = async () => {
        setIsProcessing(true)
        try {
            const options = buildOptions()
            const result = await applyPreprocessing(parseInt(id!), options)

            toast({
                title: "Preprocessing complete!",
                description: "Your data has been processed successfully",
            })

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
            const options = buildOptions()
            const code = await generatePreprocessingCode(parseInt(id!), options, 'detailed')

            const blob = new Blob([code.code], { type: 'text/plain' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${dataType}_preprocessing.py`
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
        const newEnabledSteps: Record<string, boolean> = {}
        const newStepParameters: Record<string, Record<string, any>> = {}

        template.steps.forEach(step => {
            newEnabledSteps[step.stepId] = step.enabled
            newStepParameters[step.stepId] = step.parameters
        })

        setEnabledSteps(newEnabledSteps)
        setStepParameters(newStepParameters)
    }

    if (isLoading) {
        return (
            <div className="space-y-8">
                <PageHeader
                    title={title}
                    description={description}
                    showBack
                    backPath="/datasets"
                />
                <DatasetInfoSkeleton />
                <PreprocessingStepsSkeleton />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title={title}
                description={description}
                showBack
                backPath="/datasets"
            />

            {/* Dataset Info */}
            {datasetInfo && (
                <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">{datasetInfo.filename}</h3>
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                    {datasetInfo.total_rows && <span>{datasetInfo.total_rows.toLocaleString()} rows</span>}
                                    {datasetInfo.columns?.length && (
                                        <>
                                            <span>•</span>
                                            <span>{datasetInfo.columns.length} columns</span>
                                        </>
                                    )}
                                    <span>•</span>
                                    <span>{enabledCount} of {steps.length} steps enabled</span>
                                </div>
                            </div>
                            <Badge variant="secondary" className="text-sm">
                                {badgeLabel}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Steps */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Preprocessing Steps</h2>
                        <p className="text-sm text-muted-foreground">
                            Select and configure the steps to apply to your data
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <TemplateManager
                            dataType={dataType}
                            onLoadTemplate={handleLoadTemplate}
                        />
                        <SaveTemplateDialog
                            dataType={dataType}
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
                        >
                            {isProcessing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Play className="h-4 w-4 mr-2" />
                            )}
                            Apply Preprocessing
                        </Button>
                    </div>
                </div>

                {enabledCount === 0 && (
                    <Card className="border-amber-500/50 bg-amber-500/10">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-amber-900 dark:text-amber-100">
                                        No steps enabled
                                    </p>
                                    <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                        Enable at least one preprocessing step to continue
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-3">
                    {steps.map((step) => (
                        <PreprocessingStepCard
                            key={step.id}
                            step={step}
                            isEnabled={enabledSteps[step.id]}
                            onToggle={(enabled) => handleToggleStep(step.id, enabled)}
                            parameters={stepParameters[step.id]}
                            onParameterChange={(param, value) => handleParameterChange(step.id, param, value)}
                        />
                    ))}
                </div>
            </div>

            {/* Success Summary */}
            {enabledCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="border-green-500/50 bg-green-500/10">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium text-green-900 dark:text-green-100 mb-1">
                                        Ready to process
                                    </p>
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                        {enabledCount} preprocessing {enabledCount === 1 ? 'step' : 'steps'} will be applied to your data.
                                        Click "Apply Preprocessing" to start.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    )
}
