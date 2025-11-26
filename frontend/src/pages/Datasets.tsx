import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    MoreVertical,
    FileText,
    Download,
    Trash2,
    Eye,
    Database,
    Plus,
    LayoutGrid,
    List,
    BarChart
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import EmptyState from "@/components/EmptyState"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/lib/store"
import { getDatasets, deleteDataset, downloadDataset } from "@/lib/api"
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
    const [viewMode, setViewMode] = useState<"grid" | "table">("table")
    const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)

    useEffect(() => {
        loadDatasets()
    }, [])

    const loadDatasets = async () => {
        try {
            setIsLoading(true)
            const data = await getDatasets()
            setDatasets(data)
        } catch (error) {
            console.error(error)
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
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to download dataset",
                variant: "destructive",
            })
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await deleteDataset(id)
            setDatasets(datasets.filter(d => d.id !== id))
            if (selectedDataset?.id === id) setSelectedDataset(null)
            toast({
                title: "Dataset Deleted",
                description: "The dataset has been permanently removed.",
            })
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to delete dataset",
                variant: "destructive",
            })
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
            <PageHeader
                title="Datasets"
                description="Manage and analyze your uploaded datasets"
            >
                <Button onClick={() => navigate("/upload")} className="gap-2 shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4" />
                    Upload New
                </Button>
            </PageHeader>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search datasets..."
                        className="pl-9 bg-background/50 border-transparent focus:bg-background transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                    <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="h-8 w-8 p-0"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "table" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                        className="h-8 w-8 p-0"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-muted/20 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : filteredDatasets.length > 0 ? (
                <AnimatePresence mode="wait">
                    {viewMode === "grid" ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {filteredDatasets.map((dataset) => (
                                <Card
                                    key={dataset.id}
                                    className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                                    onClick={() => setSelectedDataset(dataset)}
                                >
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium truncate" title={dataset.filename}>
                                            {dataset.filename}
                                        </CardTitle>
                                        <Database className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{dataset.row_count.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">rows • {formatSize(dataset.size_bytes)}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <Badge variant={dataset.status === 'Processed' ? 'default' : 'secondary'}>
                                                {dataset.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(dataset.upload_date), "MMM d")}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="table"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
                        >
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Name</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Dimensions</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDatasets.map((dataset) => (
                                        <TableRow
                                            key={dataset.id}
                                            className="cursor-pointer hover:bg-muted/30"
                                            onClick={() => setSelectedDataset(dataset)}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    {dataset.filename}
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatSize(dataset.size_bytes)}</TableCell>
                                            <TableCell>{dataset.row_count.toLocaleString()} × {dataset.column_count}</TableCell>
                                            <TableCell>
                                                <Badge variant={dataset.status === 'Processed' ? 'default' : 'secondary'}>
                                                    {dataset.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {format(new Date(dataset.upload_date), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="icon" onClick={() => handleView(dataset.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleDownload(dataset.id)}>
                                                                <Download className="mr-2 h-4 w-4" /> Download
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(dataset.id)}>
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </motion.div>
                    )}
                </AnimatePresence>
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

            {/* Dataset Details Sheet */}
            <Sheet open={!!selectedDataset} onOpenChange={() => setSelectedDataset(null)}>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                    {selectedDataset && (
                        <div className="space-y-6">
                            <SheetHeader>
                                <SheetTitle className="text-2xl">{selectedDataset.filename}</SheetTitle>
                                <SheetDescription>
                                    Uploaded on {format(new Date(selectedDataset.upload_date), "PPP p")}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Rows</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{selectedDataset.row_count.toLocaleString()}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Columns</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{selectedDataset.column_count}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <BarChart className="h-5 w-5 text-primary" />
                                    Quick Actions
                                </h3>
                                <div className="grid gap-3">
                                    <Button className="w-full justify-start gap-3 h-12 text-lg" onClick={() => handleView(selectedDataset.id)}>
                                        <Eye className="h-5 w-5" />
                                        Open in Dashboard
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => navigate(`/preprocessing/${selectedDataset.id}`)}>
                                        <Database className="h-5 w-5" />
                                        Start Preprocessing
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => handleDownload(selectedDataset.id)}>
                                        <Download className="h-5 w-5" />
                                        Download CSV
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-xl bg-muted/30 p-4 border border-border/50">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    File Details
                                </h4>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Size</dt>
                                        <dd className="font-mono">{formatSize(selectedDataset.size_bytes)}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Path</dt>
                                        <dd className="font-mono truncate max-w-[200px]" title={selectedDataset.filepath}>
                                            {selectedDataset.filepath}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Status</dt>
                                        <dd>
                                            <Badge variant="outline">{selectedDataset.status}</Badge>
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
