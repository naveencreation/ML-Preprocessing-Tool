import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"

interface FileUploadCardProps {
    onFileSelect: (file: File) => void
    maxSize?: number
    uploadProgress?: number
    isUploading?: boolean
    error?: string | null
    accept?: Record<string, string[]>
}

export default function FileUploadCard({
    onFileSelect,
    maxSize = 100 * 1024 * 1024, // 100MB
    uploadProgress = 0,
    isUploading = false,
    error = null,
    accept = {
        "text/csv": [".csv"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
        "application/vnd.ms-excel": [".xls"],
        "application/json": [".json"]
    }
}: FileUploadCardProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0]
                setSelectedFile(file)
                onFileSelect(file)
            }
        },
        [onFileSelect]
    )

    const { getRootProps, getInputProps, isDragActive, fileRejections } =
        useDropzone({
            onDrop,
            accept,
            maxSize,
            multiple: false,
        })

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
    }

    return (
        <Card>
            <CardContent className="p-6">
                <div
                    {...getRootProps()}
                    className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragActive
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                        }
            ${isUploading ? "pointer-events-none opacity-60" : ""}
          `}
                >
                    <input {...getInputProps()} />

                    <AnimatePresence mode="wait">
                        {!selectedFile && !isUploading && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <div className="rounded-full bg-primary/10 p-4">
                                    <Upload className="h-10 w-10 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">
                                        {isDragActive
                                            ? "Drop your file here"
                                            : "Upload your dataset"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Drag and drop your CSV, Excel, or JSON file here, or click to browse
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Maximum file size: {formatFileSize(maxSize)}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {selectedFile && !isUploading && (
                            <motion.div
                                key="selected"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-4"
                            >
                                <div className="rounded-full bg-accent/10 p-3">
                                    <FileText className="h-8 w-8 text-accent" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-medium">{selectedFile.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatFileSize(selectedFile.size)}
                                    </p>
                                </div>
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </motion.div>
                        )}

                        {isUploading && (
                            <motion.div
                                key="uploading"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-primary/10 p-3">
                                        <FileText className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">Uploading...</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedFile?.name}
                                        </p>
                                    </div>
                                </div>
                                <Progress value={uploadProgress} className="h-2" />
                                <p className="text-sm text-muted-foreground">
                                    {uploadProgress}% complete
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 flex items-center gap-2 text-destructive"
                    >
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm">{error}</p>
                    </motion.div>
                )}

                {fileRejections.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4"
                    >
                        {fileRejections.map(({ file, errors }) => (
                            <div key={file.name} className="flex items-center gap-2 text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <p className="text-sm">
                                    {errors[0].message}
                                </p>
                            </div>
                        ))}
                    </motion.div>
                )}
            </CardContent>
        </Card>
    )
}
