import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, ArrowRightCircle } from "lucide-react"

interface EducationalCardProps {
    title: string
    description: string
    nextStep?: string
}

export function EducationalCard({ title, description, nextStep }: EducationalCardProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Why this step matters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                        {description}
                    </p>
                </CardContent>
            </Card>

            {nextStep && (
                <Card className="bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                            <ArrowRightCircle className="h-4 w-4" />
                            What happens next
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                            {nextStep}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
