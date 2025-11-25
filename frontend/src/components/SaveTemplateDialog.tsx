import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createTemplate } from "@/lib/api"
import type { PreprocessingOptions } from "@/lib/api"
import { Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SaveTemplateDialogProps {
    config: PreprocessingOptions
}

export function SaveTemplateDialog({ config }: SaveTemplateDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleSave = async () => {
        if (!name) return
        setLoading(true)
        try {
            await createTemplate({ name, description, config })
            toast({ title: "Template saved", description: `Template "${name}" saved successfully.` })
            setOpen(false)
            setName("")
            setDescription("")
        } catch (error: any) {
            toast({ title: "Error saving template", description: error.response?.data?.detail || "Unknown error", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    Save Template
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Save Preprocessing Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Standard Cleaning" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description..." />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!name || loading}>
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
