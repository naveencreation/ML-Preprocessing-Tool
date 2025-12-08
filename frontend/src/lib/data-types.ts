/**
 * Shared data type configurations
 * Single source of truth for all data type metadata used across the app
 */
import {
    Database,
    FileText,
    Image as ImageIcon,
    Music,
    Video,
    FileCode,
    type LucideIcon
} from "lucide-react"

export type DataType = "dataset" | "text" | "image" | "audio" | "video" | "logs"

export interface DataTypeConfig {
    id: DataType
    icon: LucideIcon
    title: string
    description: string
    fileTypes: string
    acceptedExtensions: string[]
    accept: Record<string, string[]>
    color: string
    bgColor: string
    steps: string[]
    comingSoon?: boolean
}

export const DATA_TYPES: DataTypeConfig[] = [
    {
        id: "dataset",
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
        id: "text",
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
        id: "image",
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
        id: "audio",
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
        id: "video",
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
        id: "logs",
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

/**
 * Get data type config by ID
 */
export function getDataTypeById(id: DataType | string | null): DataTypeConfig | undefined {
    return DATA_TYPES.find(dt => dt.id === id)
}

/**
 * Get all active (non-coming-soon) data types
 */
export function getActiveDataTypes(): DataTypeConfig[] {
    return DATA_TYPES.filter(dt => !dt.comingSoon)
}
