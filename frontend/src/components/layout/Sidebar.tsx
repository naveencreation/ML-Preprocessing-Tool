import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    Home,
    Upload,
    Database,
    Settings,
    ChevronLeft,
    BarChart3,
    GitBranch,
    FileText
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Upload Dataset", href: "/upload", icon: Upload },
    { name: "Datasets", href: "/datasets", icon: Database },
    { name: "Workflows", href: "/workflows", icon: GitBranch },
    { name: "Logs", href: "/logs", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
    const location = useLocation()
    const { sidebarCollapsed, toggleSidebar } = useAppStore()

    const isActive = (path: string) => {
        if (path === "/") {
            return location.pathname === "/"
        }
        return location.pathname.startsWith(path)
    }

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r bg-card/80 backdrop-blur-xl transition-all duration-300 hidden lg:block",
                sidebarCollapsed ? "w-20" : "w-72"
            )}
        >
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-20 items-center px-6 border-b border-border/50">
                    <motion.div
                        className="flex items-center gap-4"
                        layout
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                            <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <AnimatePresence>
                            {!sidebarCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="overflow-hidden"
                                >
                                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent whitespace-nowrap">
                                        ML Studio
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2 p-4 overflow-y-auto scrollbar-thin">
                    {navigation.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <Link key={item.name} to={item.href}>
                                <div className="relative group">
                                    {active && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-primary/10 rounded-xl"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start gap-4 h-12 rounded-xl relative z-10 hover:bg-transparent",
                                            active ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground",
                                            sidebarCollapsed && "justify-center px-0"
                                        )}
                                    >
                                        <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", active && "text-primary")} />
                                        <AnimatePresence>
                                            {!sidebarCollapsed && (
                                                <motion.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: "auto" }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    className="whitespace-nowrap overflow-hidden"
                                                >
                                                    {item.name}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </Button>
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Collapse Toggle */}
                <div className="p-4 border-t border-border/50">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="w-full h-10 rounded-xl hover:bg-muted/50"
                    >
                        <ChevronLeft
                            className={cn(
                                "h-5 w-5 transition-transform duration-300 text-muted-foreground",
                                sidebarCollapsed && "rotate-180"
                            )}
                        />
                    </Button>
                </div>
            </div>
        </aside>
    )
}
