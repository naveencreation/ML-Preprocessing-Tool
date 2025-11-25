import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import PageHeader from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    MoreVertical,
    FileText,
    Download,
    Trash2,
    Eye,
    Calendar,
    Database,
    Plus,
    Pencil
} from "lucide-react"
import { motion } from "framer-motion"
import EmptyState from "@/components/EmptyState"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/lib/store"
import { getDatasets, deleteDataset, downloadDataset, updateDataset } from "@/lib/api"
import { format } from "date-fns"

interface Dataset {
    id: number
    filename: string
    upload_date: string
    size_bytes: number
    row_count: number
    column_count: number
    filepath: string
    status: string
}

export default function Datasets() {
    const navigate = useNavigate()
    const { toast } = useToast()
    const { setCurrentDataset } = useAppStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [datasets, setDatasets] = useState<Dataset[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Delete Dialog State
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Rename Dialog State
    const [renameId, setRenameId] = useState<number | null>(null)
    const [newName, setNewName] = useState("")
    const [isRenaming, setIsRenaming] = useState(false)

    useEffect(() => {
        loadDatasets()
    }, [])

    const loadDatasets = async () => {
        try {
            setIsLoading(true)
            const data = await getDatasets()
            setDatasets(data)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load datasets",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleView = (id: number) => {
        setCurrentDataset(id)
        navigate(`/dashboard/${id}`)
    }

    const handleDownload = (id: number) => {
        try {
            downloadDataset(id)
            toast({
                title: "Download Started",
                description: "Your dataset download has started.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to download dataset",
                variant: "destructive",
            })
        }
    }

    const confirmDelete = (id: number) => {
        setDeleteId(id)
    }

    const handleDelete = async () => {
        if (!deleteId) return

        try {
            setIsDeleting(true)
            await deleteDataset(deleteId)
            setDatasets(datasets.filter(d => d.id !== deleteId))
            toast({
                title: "Dataset Deleted",
                description: "The dataset and its processed versions have been permanently removed.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete dataset",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
            setDeleteId(null)
        }
    }

    const startRename = (dataset: Dataset) => {
        setRenameId(dataset.id)
        setNewName(dataset.filename)
    }

    const handleRename = async () => {
        if (!renameId || !newName.trim()) return

        try {
            setIsRenaming(true)
            const updated = await updateDataset(renameId, { filename: newName })
            setDatasets(datasets.map(d => d.id === renameId ? updated : d))
            toast({
                title: "Dataset Renamed",
                description: "The dataset has been successfully renamed.",
            })
            setRenameId(null)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to rename dataset",
                variant: "destructive",
            })
        } finally {
            setIsRenaming(false)
        }
    }

    const filteredDatasets = datasets.filter(dataset =>
        dataset.filename.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <PageHeader
                    title="Datasets"
                    description="Manage your uploaded datasets"
                />
                <Button onClick={() => navigate("/upload")} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Upload New
                </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search datasets..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Datasets Grid */}
            {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-[100px] bg-muted/50" />
                            <CardContent className="h-[100px] bg-muted/30" />
                        </Card>
                    ))}
                </div>
            ) : filteredDatasets.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredDatasets.map((dataset, index) => (
                        <motion.div
                            key={dataset.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                                <CardHeader className="relative pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                <Database className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle className="text-base line-clamp-1" title={dataset.filename}>
                                                    {dataset.filename}
                                                </CardTitle>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(dataset.upload_date), "MMM d, yyyy")}
                                                </div>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleView(dataset.id)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Analysis
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => startRename(dataset)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDownload(dataset.id)}>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => confirmDelete(dataset.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">Size</p>
                                            <p className="font-medium">{formatSize(dataset.size_bytes)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">Dimensions</p>
                                            <p className="font-medium">{dataset.row_count} × {dataset.column_count}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {dataset.row_count} rows
                                            </Badge>
                                            <Badge variant={dataset.status === 'Processed' ? 'default' : 'outline'} className="text-xs">
                                                {dataset.status}
                                            </Badge>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs" onClick={() => handleView(dataset.id)}>
                                            <FileText className="h-3 w-3" />
                                            Analyze
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={Database}
                    title="No Datasets Found"
                    description={searchQuery ? "No datasets match your search query." : "You haven't uploaded any datasets yet."}
                    action={{
                        label: "Upload Dataset",
                        onClick: () => navigate("/upload")
                    }}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the dataset
                            and any processed versions derived from it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Rename Dialog */}
            <Dialog open={!!renameId} onOpenChange={() => setRenameId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Dataset</DialogTitle>
                        <DialogDescription>
                            Enter a new name for your dataset.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Dataset name"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename()
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameId(null)} disabled={isRenaming}>
                            Cancel
                        </Button>
                        <Button onClick={handleRename} disabled={isRenaming || !newName.trim()}>
                            {isRenaming ? "Renaming..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
