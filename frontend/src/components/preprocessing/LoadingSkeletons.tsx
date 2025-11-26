import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function PreprocessingStepsSkeleton() {
    return (
        <div className="space-y-3">
            {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="opacity-70">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                                <Skeleton className="h-4 w-4 rounded" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-8" />
                        </div>
                    </CardHeader>
                </Card>
            ))}
        </div>
    )
}

export function DataPreviewSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {/* Table header */}
                    <div className="flex gap-4">
                        {Array(5).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-10 flex-1" />
                        ))}
                    </div>
                    {/* Table rows */}
                    {Array(10).fill(0).map((_, i) => (
                        <div key={i} className="flex gap-4">
                            {Array(5).fill(0).map((_, j) => (
                                <Skeleton key={j} className="h-8 flex-1" />
                            ))}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export function DataTypeCardsSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="opacity-70">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-3/4" />
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function DatasetInfoSkeleton() {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-64" />
                        <div className="flex gap-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
            </CardContent>
        </Card>
    )
}
