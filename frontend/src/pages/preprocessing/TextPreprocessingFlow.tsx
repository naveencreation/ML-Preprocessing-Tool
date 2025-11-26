import GenericPreprocessingFlow from "@/components/preprocessing/GenericPreprocessingFlow"
import { preprocessingSteps } from "@/data/preprocessingSteps"

export default function TextPreprocessingFlow() {
    return (
        <GenericPreprocessingFlow
            dataType="text"
            steps={preprocessingSteps.text}
            title="Text Preprocessing"
            description="Configure step-by-step preprocessing for your text data"
            badgeLabel="Text Data"
        />
    )
}
