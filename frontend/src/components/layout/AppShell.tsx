import { type ReactNode, useState } from "react"
import { useAppStore } from "@/lib/store"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router-dom"
import { Home, Upload, Database, Settings, GitBranch, FileText, BarChart3, BookOpen } from "lucide-react"

interface AppShellProps {
    children: ReactNode
}

const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Overview", href: "/overview", icon: BookOpen },
    { name: "Upload Dataset", href: "/upload", icon: Upload },
    { name: "Datasets", href: "/datasets", icon: Database },
    { name: "Workflows", href: "/workflows", icon: GitBranch },
    { name: "Logs", href: "/logs", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
]

export function AppShell({ children }: AppShellProps) {
    const { sidebarCollapsed } = useAppStore()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()

    const isActive = (path: string) => {
        if (path === "/") return location.pathname === "/"
        return location.pathname.startsWith(path)
    }

    return (
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20">
            <Sidebar />

            {/* Mobile Sidebar */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="left" className="w-72 p-0 border-r border-border/50">
                    <div className="flex h-full flex-col bg-card/95 backdrop-blur-xl">
                        <div className="flex h-20 items-center px-6 border-b border-border/50">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                                    <BarChart3 className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                                    ML Studio
                                </span>
                            </div>
                        </div>

                        <nav className="flex-1 space-y-2 p-4">
                            {navigation.map((item) => {
                                const active = isActive(item.href)
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Button
                                            variant={active ? "secondary" : "ghost"}
                                            className={cn(
                                                "w-full justify-start gap-4 h-12 rounded-xl",
                                                active && "bg-primary/10 text-primary hover:bg-primary/20"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            {item.name}
                                        </Button>
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>

            <div
                className={cn(
                    "transition-all duration-300 ease-in-out min-h-screen flex flex-col",
                    sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
                )}
            >
                <Header onMenuClick={() => setMobileMenuOpen(true)} />

                <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="mx-auto max-w-7xl"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    )
}
