import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getTemplates, deleteTemplate, type PreprocessingTemplate } from "@/lib/templates"
import { Download, Trash2, CheckCircle2, Layers } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface TemplateManagerProps {
    dataType: 'dataset' | 'text' | 'image' | 'audio' | 'logs'
    onLoadTemplate: (template: PreprocessingTemplate) => void
}

export function TemplateManager({ dataType, onLoadTemplate }: TemplateManagerProps) {
    const [open, setOpen] = useState(false)
    const [templates, setTemplates] = useState<PreprocessingTemplate[]>([])
    const { toast } = useToast()

    const loadTemplates = () => {
        const loaded = getTemplates(dataType)
        setTemplates(loaded)
    }

    const handleOpen = (isOpen: boolean) => {
        setOpen(isOpen)
        if (isOpen) {
            loadTemplates()
        }
    }

    const handleLoad = (template: PreprocessingTemplate) => {
        onLoadTemplate(template)
        setOpen(false)
        toast({
            title: "Template loaded",
            description: `"${template.name}" configuration has been applied.`,
        })
    }

    const handleDelete = (id: string, name: string) => {
        const success = deleteTemplate(id)
        if (success) {
            loadTemplates()
            toast({
                title: "Template deleted",
                description: `"${name}" has been removed.`,
            })
        } else {
            toast({
                title: "Cannot delete",
                description: "Default templates cannot be deleted.",
                variant: "destructive",
            })
        }
    }

    const isDefaultTemplate = (id: string) => {
        return id.startsWith('dataset-') || id.startsWith('text-') || id.startsWith('image-')
    }

    const enabledCount = (template: PreprocessingTemplate) => {
        return template.steps.filter(s => s.enabled).length
    }

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Layers className="h-4 w-4 mr-2" />
                    Load Template
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Configuration Templates</DialogTitle>
                    <DialogDescription>
                        Load a saved preprocessing configuration to quickly set up your pipeline.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[400px] pr-4">
                    {templates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-sm text-muted-foreground">
                                No templates available for {dataType} data
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence>
                                {templates.map((template) => (
                                    <motion.div
                                        key={template.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <Card className="hover:border-primary/50 transition-colors">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <CardTitle className="text-base">
                                                                {template.name}
                                                            </CardTitle>
                                                            {isDefaultTemplate(template.id) && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Default
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <CardDescription className="text-sm">
                                                            {template.description}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pb-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span>
                                                            {enabledCount(template)} of {template.steps.length} steps enabled
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleLoad(template)}
                                                        >
                                                            <Download className="h-3.5 w-3.5 mr-1.5" />
                                                            Load
                                                        </Button>
                                                        {!isDefaultTemplate(template.id) && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(template.id, template.name)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
