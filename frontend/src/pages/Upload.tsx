import { useState } from "react"
import { useNavigate } from "react-router-dom"
import PageHeader from "@/components/PageHeader"
import FileUploadCard from "@/components/FileUploadCard"
import { uploadDataset } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, Database } from "lucide-react"
import { motion } from "framer-motion"

export default function Upload() {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const { toast } = useToast()

    const handleFileSelect = async (file: File) => {
        setError(null)

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
                variant: "default", // or "warning" if available, but default is fine
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
            const dataset = await uploadDataset(file)
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
                title="Upload Dataset"
                description="Upload your CSV file to get started with data preprocessing and analysis"
                showBack
                backPath="/"
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Upload Area */}
                <div className="lg:col-span-2">
                    <FileUploadCard
                        onFileSelect={handleFileSelect}
                        isUploading={isUploading}
                        uploadProgress={uploadProgress}
                        error={error}
                    />
                </div>

                {/* Info Cards */}
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                    </div>
                                    <CardTitle className="text-base">File Requirements</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <p>• CSV, Excel, or JSON format</p>
                                <p>• Maximum file size: 100MB</p>
                                <p>• First row should contain column names</p>
                                <p>• UTF-8 encoding recommended</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-accent/10 p-2">
                                        <Clock className="h-4 w-4 text-accent" />
                                    </div>
                                    <CardTitle className="text-base">What Happens Next?</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <p>1. Your file will be analyzed</p>
                                <p>2. Data preview will be generated</p>
                                <p>3. Configure preprocessing options</p>
                                <p>4. View insights and visualizations</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <Database className="h-4 w-4 text-primary" />
                                    </div>
                                    <CardTitle className="text-base">Your Data is Safe</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                All uploads are encrypted and stored securely. Your data is never shared
                                with third parties.
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
