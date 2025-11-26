import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { getDatasetPreview } from "@/lib/api"
import DatasetPreprocessingFlow from "./preprocessing/DatasetPreprocessingFlow"
import TextPreprocessingFlow from "./preprocessing/TextPreprocessingFlow"
import ImagePreprocessingFlow from "./preprocessing/ImagePreprocessingFlow"
import AudioPreprocessingFlow from "./preprocessing/AudioPreprocessingFlow"
import VideoPreprocessingFlow from "./preprocessing/VideoPreprocessingFlow"
import LogsPreprocessingFlow from "./preprocessing/LogsPreprocessingFlow"

// This page routes to the appropriate preprocessing flow based on data type
export default function Preprocessing() {
    const { id } = useParams<{ id: string }>()
    const [datasetType, setDatasetType] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadDatasetType()
    }, [id])

    const loadDatasetType = async () => {
        try {
            // Get dataset info to determine type
            const preview = await getDatasetPreview(parseInt(id!))
            // Use dataset_type from backend, default to 'dataset' if not set
            setDatasetType(preview.dataset_type || 'dataset')
        } catch (error) {
            console.error('Failed to load dataset type:', error)
            // Default to dataset type
            setDatasetType('dataset')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Route to appropriate preprocessing flow based on dataset type
    switch (datasetType) {
        case 'dataset':
        case 'tabular':
            return <DatasetPreprocessingFlow />

        case 'text':
            return <TextPreprocessingFlow />

        case 'image':
            return <ImagePreprocessingFlow />

        case 'audio':
            return <AudioPreprocessingFlow />

        case 'video':
            return <VideoPreprocessingFlow />

        case 'logs':
            return <LogsPreprocessingFlow />

        default:
            return <DatasetPreprocessingFlow />
    }
}
