import { useState } from "react"
import { useNavigate } from "react-router-dom"
import PageHeader from "@/components/PageHeader"
import FileUploadCard from "@/components/FileUploadCard"
import { DataTypeCard } from "@/components/DataTypeCard"
import { uploadDataset } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Database,
    FileText,
    Image as ImageIcon,
    Music,
    Video,
    FileCode,
    Info,
    CheckCircle2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type DataType = "dataset" | "text" | "image" | "audio" | "video" | "logs" | null

const dataTypes = [
    {
        id: "dataset" as const,
        icon: Database,
        title: "Dataset / Tabular",
        description: "CSV, Excel, structured data with rows and columns",
        fileTypes: ".csv, .xlsx, .json",
        acceptedExtensions: [".csv", ".xlsx", ".json"],
        accept: {
            "text/csv": [".csv"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.ms-excel": [".xls"],
            "application/json": [".json"]
        },
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        steps: ["Missing Values", "Encoding", "Scaling", "Outliers", "Feature Selection", "Train-Test Split"]
    },
    {
        id: "text" as const,
        icon: FileText,
        title: "Text",
        description: "Documents, reviews, social media, any text data",
        fileTypes: ".txt, .csv (with text column)",
        acceptedExtensions: [".txt", ".csv"],
        accept: {
            "text/plain": [".txt"],
            "text/csv": [".csv"]
        },
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        steps: ["Cleaning", "Tokenization", "Stopword Removal", "Lemmatization", "Vectorization"]
    },
    {
        id: "image" as const,
        icon: ImageIcon,
        title: "Image",
        description: "Photos, medical scans, satellite imagery",
        fileTypes: ".jpg, .png, .tiff, .bmp",
        acceptedExtensions: [".jpg", ".jpeg", ".png", ".tiff", ".bmp"],
        accept: {
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/tiff": [".tiff"],
            "image/bmp": [".bmp"]
        },
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        steps: ["Resize", "Normalize", "Augment", "Convert to Tensor"]
    },
    {
        id: "audio" as const,
        icon: Music,
        title: "Audio",
        description: "Speech, music, sound recordings",
        fileTypes: ".wav, .mp3, .flac, .ogg, .m4a",
        acceptedExtensions: [".wav", ".mp3", ".flac", ".ogg", ".m4a"],
        accept: {
            "audio/wav": [".wav"],
            "audio/mpeg": [".mp3"],
            "audio/flac": [".flac"],
            "audio/ogg": [".ogg"],
            "audio/mp4": [".m4a"]
        },
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        steps: ["Resample", "Trim Silence", "Extract MFCCs", "Spectrogram"]
    },
    {
        id: "video" as const,
        icon: Video,
        title: "Video",
        description: "Movies, surveillance footage, activity recordings",
        fileTypes: ".mp4, .avi, .mov",
        acceptedExtensions: [".mp4", ".avi", ".mov"],
        accept: {
            "video/mp4": [".mp4"],
            "video/x-msvideo": [".avi"],
            "video/quicktime": [".mov"]
        },
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        steps: ["Extract Frames", "Resize", "Extract Audio", "Scene Detection"],
        comingSoon: true
    },
    {
        id: "logs" as const,
        icon: FileCode,
        title: "Logs",
        description: "System logs, application logs, server logs",
        fileTypes: ".log, .txt, .csv",
        acceptedExtensions: [".log", ".txt", ".csv"],
        accept: {
            "text/plain": [".txt", ".log"],
            "text/csv": [".csv"]
        },
        color: "text-teal-500",
        bgColor: "bg-teal-500/10",
        steps: ["Parse Timestamps", "Extract Levels", "Pattern Extraction", "Anomaly Detection"]
    }
]

export default function Upload() {
    const [selectedType, setSelectedType] = useState<DataType>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const { toast } = useToast()

    const selectedTypeData = dataTypes.find(t => t.id === selectedType)

    const handleFileSelect = async (file: File) => {
        setError(null)

        // Validate file type against selected data type
        if (selectedTypeData) {
            const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
            if (!selectedTypeData.acceptedExtensions.includes(fileExtension)) {
                setError(`Invalid file type. Expected: ${selectedTypeData.fileTypes}`)
                toast({
                    title: "Invalid file type",
                    description: `Please upload a ${selectedTypeData.fileTypes} file.`,
                    variant: "destructive",
                })
                return
            }
        }

        // Check file size (100MB limit)
        const fileSizeMB = file.size / (1024 * 1024)
        if (fileSizeMB > 100) {
            setError("File size exceeds 100MB limit")
            toast({
                title: "File too large",
                description: "Please upload a file smaller than 100MB.",
                variant: "destructive",
            })
            return
        }

        // Warning for files > 5MB
        if (fileSizeMB > 5) {
            toast({
                title: "Large file detected",
                description: "Processing large files (>5MB) may take a moment. Please be patient.",
            })
        }

        setIsUploading(true)
        setUploadProgress(0)

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval)
                    return prev
                }
                return prev + 10
            })
        }, 300)

        try {
            const dataset = await uploadDataset(file, selectedType || "dataset")
            setUploadProgress(100)

            toast({
                title: "Upload successful!",
                description: `${file.name} has been uploaded successfully.`,
            })

            // Navigate after a short delay to show 100% progress
            setTimeout(() => {
                navigate(`/preprocessing/${dataset.id}`)
            }, 500)
        } catch (err) {
            clearInterval(progressInterval)
            setError(err instanceof Error ? err.message : "Upload failed")
            toast({
                title: "Upload failed",
                description: "There was an error uploading your file. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Upload Data"
                description="Select your data type and upload your file to start preprocessing"
                showBack
                backPath="/"
            />

            {/* Data Type Selection */}
            {!selectedType && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-semibold">What type of data are you uploading?</h2>
                        <p className="text-muted-foreground">Select the type that best matches your data</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {dataTypes.map((type) => (
                            <DataTypeCard
                                key={type.id}
                                icon={type.icon}
                                title={type.title}
                                description={type.description}
                                fileTypes={type.fileTypes}
                                color={type.color}
                                bgColor={type.bgColor}
                                steps={type.steps}
                                comingSoon={type.comingSoon}
                                onClick={() => !type.comingSoon && setSelectedType(type.id)}
                            />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Upload Section */}
            <AnimatePresence mode="wait">
                {selectedType && selectedTypeData && (
                    <motion.div
                        key="upload-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Selected Type Header */}
                        <Card className="border-primary/30 bg-primary/5">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={cn("inline-flex h-14 w-14 items-center justify-center rounded-xl", selectedTypeData.bgColor)}>
                                            <selectedTypeData.icon className={cn("h-7 w-7", selectedTypeData.color)} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-semibold">{selectedTypeData.title}</h3>
                                                <Badge variant="secondary">Selected</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{selectedTypeData.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                                <span className="font-medium">Accepted formats:</span> {selectedTypeData.fileTypes}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedType(null)
                                            setError(null)
                                        }}
                                    >
                                        Change Type
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Upload Area */}
                            <div className="lg:col-span-2">
                                <FileUploadCard
                                    onFileSelect={handleFileSelect}
                                    isUploading={isUploading}
                                    uploadProgress={uploadProgress}
                                    error={error}
                                    accept={selectedTypeData.accept}
                                />
                            </div>

                            {/* Info Sidebar */}
                            <div className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center gap-2">
                                                <div className="rounded-lg bg-primary/10 p-2">
                                                    <Info className="h-4 w-4 text-primary" />
                                                </div>
                                                <CardTitle className="text-base">Preprocessing Steps</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <p className="text-sm text-muted-foreground mb-3">
                                                After upload, you'll be guided through:
                                            </p>
                                            {selectedTypeData.steps.map((step, index) => (
                                                <div key={step} className="flex items-center gap-2 text-sm">
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                                        {index + 1}
                                                    </div>
                                                    <span className="text-muted-foreground">{step}</span>
                                                </div>
                                            ))}
                                            <div className="pt-3 mt-3 border-t">
                                                <p className="text-xs text-muted-foreground italic">
                                                    Each step includes explanations, examples, and code snippets
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Card className="border-green-500/20 bg-green-500/5">
                                        <CardHeader>
                                            <div className="flex items-center gap-2">
                                                <div className="rounded-lg bg-green-500/10 p-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                </div>
                                                <CardTitle className="text-base">What You'll Get</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                                            <p>✓ Clean, processed data</p>
                                            <p>✓ Before/after comparisons</p>
                                            <p>✓ Python code to reproduce steps</p>
                                            <p>✓ Downloadable Jupyter notebooks</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
