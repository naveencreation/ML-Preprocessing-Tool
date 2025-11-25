import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getTemplates, deleteTemplate } from "@/lib/api"
import type { WorkflowTemplate, PreprocessingOptions } from "@/lib/api"
import { FolderOpen, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LoadTemplateDialogProps {
    onSelect: (config: PreprocessingOptions) => void
}

export function LoadTemplateDialog({ onSelect }: LoadTemplateDialogProps) {
    const [open, setOpen] = useState(false)
    const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const fetchTemplates = async () => {
        setLoading(true)
        try {
            const data = await getTemplates()
            setTemplates(data)
        } catch (error) {
            toast({ title: "Error loading templates", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            fetchTemplates()
        }
    }, [open])

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await deleteTemplate(id)
            setTemplates(templates.filter(t => t.id !== id))
            toast({ title: "Template deleted" })
        } catch (error) {
            toast({ title: "Error deleting template", variant: "destructive" })
        }
    }

    const handleSelect = (template: WorkflowTemplate) => {
        onSelect(template.config)
        setOpen(false)
        toast({ title: "Template loaded", description: `Configuration loaded from "${template.name}"` })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Load Template
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Load Preprocessing Template</DialogTitle>
                </DialogHeader>
                <div className="h-[400px] pr-4 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No templates found. Save one first!</div>
                    ) : (
                        <div className="space-y-2">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                                    onClick={() => handleSelect(template)}
                                >
                                    <div>
                                        <h4 className="font-medium">{template.name}</h4>
                                        {template.description && (
                                            <p className="text-sm text-muted-foreground">{template.description}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Created: {new Date(template.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => handleDelete(template.id, e)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
