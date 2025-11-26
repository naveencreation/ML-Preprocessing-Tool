import GenericPreprocessingFlow from "@/components/preprocessing/GenericPreprocessingFlow"
import { preprocessingSteps } from "@/data/preprocessingSteps"

export default function AudioPreprocessingFlow() {
    return (
        <GenericPreprocessingFlow
            dataType="audio"
            steps={preprocessingSteps.audio}
            title="Audio Preprocessing"
            description="Configure step-by-step preprocessing for your audio data"
            badgeLabel="Audio Data"
        />
    )
}
