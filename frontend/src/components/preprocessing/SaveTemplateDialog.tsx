import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { saveTemplate } from "@/lib/templates"
import { Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SaveTemplateDialogProps {
    dataType: 'dataset' | 'text' | 'image' | 'audio' | 'logs'
    currentConfig: {
        enabledSteps: Record<string, boolean>
        stepParameters: Record<string, Record<string, any>>
    }
}

export function SaveTemplateDialog({ dataType, currentConfig }: SaveTemplateDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const { toast } = useToast()

    const handleSave = () => {
        if (!name.trim()) {
            toast({
                title: "Name required",
                description: "Please enter a name for your template.",
                variant: "destructive",
            })
            return
        }

        // Convert current config to template format
        const steps = Object.keys(currentConfig.enabledSteps).map(stepId => ({
            stepId,
            enabled: currentConfig.enabledSteps[stepId],
            parameters: currentConfig.stepParameters[stepId] || {}
        }))

        const template = saveTemplate({
            name: name.trim(),
            description: description.trim() || `Custom ${dataType} preprocessing template`,
            dataType,
            steps
        })

        toast({
            title: "Template saved",
            description: `"${template.name}" has been saved successfully.`,
        })

        // Reset and close
        setName("")
        setDescription("")
        setOpen(false)
    }

    const enabledCount = Object.values(currentConfig.enabledSteps).filter(Boolean).length

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" disabled={enabledCount === 0}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Save Configuration Template</DialogTitle>
                    <DialogDescription>
                        Save your current preprocessing configuration for reuse on other datasets.
                        {enabledCount > 0 && (
                            <span className="block mt-2 text-primary">
                                {enabledCount} {enabledCount === 1 ? 'step' : 'steps'} enabled
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Template Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., My Custom Pipeline"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Brief description of when to use this template..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Template
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
