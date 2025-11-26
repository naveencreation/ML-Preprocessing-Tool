import GenericPreprocessingFlow from "@/components/preprocessing/GenericPreprocessingFlow"
import { preprocessingSteps } from "@/data/preprocessingSteps"

export default function ImagePreprocessingFlow() {
    return (
        <GenericPreprocessingFlow
            dataType="image"
            steps={preprocessingSteps.image}
            title="Image Preprocessing"
            description="Configure step-by-step preprocessing for your image data"
            badgeLabel="Image Data"
        />
    )
}
