import { type ReactNode } from "react"
import { motion } from "framer-motion"

interface PageHeaderProps {
    title: string
    description?: string
    children?: ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-1.5"
            >
                <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    {title}
                </h2>
                {description && (
                    <p className="text-muted-foreground text-lg">
                        {description}
                    </p>
                )}
            </motion.div>
            {children && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex items-center gap-2"
                >
                    {children}
                </motion.div>
            )}
        </div>
    )
}
