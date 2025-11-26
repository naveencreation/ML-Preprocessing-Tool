import { useState, useEffect } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileCode, MoreVertical, Trash2, Play, Calendar, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getTemplates, deleteTemplate, createTemplate } from "@/lib/api"
import type { WorkflowTemplate, PreprocessingOptions } from "@/lib/api"
import { format } from "date-fns"
import EmptyState from "@/components/EmptyState"

export default function Workflows() {
    const { toast } = useToast()
    const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newTemplate, setNewTemplate] = useState({ name: "", description: "" })

    useEffect(() => {
        loadTemplates()
    }, [])

    const loadTemplates = async () => {
        try {
            setLoading(true)
            const data = await getTemplates()
            setTemplates(data)
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to load workflow templates",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await deleteTemplate(id)
            setTemplates(templates.filter(t => t.id !== id))
            toast({
                title: "Template Deleted",
                description: "Workflow template has been removed.",
            })
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to delete template",
                variant: "destructive"
            })
        }
    }

    const handleCreate = async () => {
        try {
            // Create a basic template (in real app, this might come from current config)
            await createTemplate({
                name: newTemplate.name,
                description: newTemplate.description,
                config: {
                    missing_option: "Drop Rows",
                    encoding_method: "None",
                    scaling_method: "None"
                } as unknown as PreprocessingOptions
            })
            setIsCreateOpen(false)
            setNewTemplate({ name: "", description: "" })
            loadTemplates()
            toast({
                title: "Success",
                description: "New workflow template created",
            })
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to create template",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Workflow Templates"
                description="Manage and reuse your preprocessing pipelines"
            >
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 shadow-lg shadow-primary/20">
                            <Plus className="h-4 w-4" />
                            Create Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Template</DialogTitle>
                            <DialogDescription>
                                Create a new empty template. You can also save templates directly from the Preprocessing page.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    value={newTemplate.name}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                    placeholder="e.g., Standard Cleaning Pipeline"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={newTemplate.description}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                                    placeholder="Describe what this pipeline does..."
                                />
                            </div>
                            <Button onClick={handleCreate} disabled={!newTemplate.name} className="w-full">
                                Create Template
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </PageHeader>

            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-muted/20 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : templates.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                        <Card key={template.id} className="group hover:border-primary/50 transition-all hover:shadow-md">
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <FileCode className="h-4 w-4 text-primary" />
                                        {template.name}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {template.description || "No description provided"}
                                    </CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="-mr-2">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(template.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(template.config).slice(0, 3).map(([key, value]) => (
                                            value && value !== "None" && value !== false ? (
                                                <Badge key={key} variant="secondary" className="text-xs">
                                                    {key.replace(/_/g, ' ')}
                                                </Badge>
                                            ) : null
                                        ))}
                                        {Object.keys(template.config).length > 3 && (
                                            <Badge variant="outline" className="text-xs">...</Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Calendar className="mr-1 h-3 w-3" />
                                            {format(new Date(template.created_at), "MMM d, yyyy")}
                                        </div>
                                        <Button size="sm" variant="outline" className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <Play className="h-3 w-3" />
                                            Use Template
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={FileCode}
                    title="No Templates Found"
                    description="Create a template to save your preprocessing configurations."
                    action={{
                        label: "Create Template",
                        onClick: () => setIsCreateOpen(true)
                    }}
                />
            )}
        </div>
    )
}
