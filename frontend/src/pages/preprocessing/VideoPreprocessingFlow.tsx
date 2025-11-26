import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PageHeader from "@/components/PageHeader"
import { Video, Clock } from "lucide-react"

// Placeholder for Video preprocessing - marked as "Coming Soon"
export default function VideoPreprocessingFlow() {
    return (
        <div className="space-y-8">
            <PageHeader
                title="Video Preprocessing"
                description="Video preprocessing capabilities are coming soon"
                showBack
                backPath="/datasets"
            />

            <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
                <CardContent className="pt-12 pb-12">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <div className="rounded-full bg-red-500/10 p-6">
                            <Video className="h-16 w-16 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                                <h2 className="text-2xl font-semibold">Video Preprocessing</h2>
                                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Coming Soon
                                </Badge>
                            </div>
                            <p className="text-muted-foreground max-w-md">
                                Video preprocessing features are currently under development. This will include:
                            </p>
                        </div>
                        <div className="grid gap-3 text-left max-w-md mt-6">
                            <div className="flex items-start gap-2">
                                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                                    <div className="h-2 w-2 bg-primary rounded-full" />
                                </div>
                                <p className="text-sm">Frame extraction and sampling</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                                    <div className="h-2 w-2 bg-primary rounded-full" />
                                </div>
                                <p className="text-sm">Video resizing and normalization</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                                    <div className="h-2 w-2 bg-primary rounded-full" />
                                </div>
                                <p className="text-sm">Audio track extraction</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                                    <div className="h-2 w-2 bg-primary rounded-full" />
                                </div>
                                <p className="text-sm">Scene detection and segmentation</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-8">
                            Check back soon for updates!
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
