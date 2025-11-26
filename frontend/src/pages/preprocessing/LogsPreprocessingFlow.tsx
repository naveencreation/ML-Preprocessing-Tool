import GenericPreprocessingFlow from "@/components/preprocessing/GenericPreprocessingFlow"
import { preprocessingSteps } from "@/data/preprocessingSteps"

export default function LogsPreprocessingFlow() {
    return (
        <GenericPreprocessingFlow
            dataType="logs"
            steps={preprocessingSteps.logs}
            title="Logs Preprocessing"
            description="Configure step-by-step preprocessing for your log data"
            badgeLabel="Log Data"
        />
    )
}
