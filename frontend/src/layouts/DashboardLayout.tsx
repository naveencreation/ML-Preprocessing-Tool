import { type ReactNode, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
    Home,
    Upload,
    Database,
    BarChart3,
    Settings,
    Menu,
    ChevronLeft,
    Moon,
    Sun
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useTheme } from "@/components/ThemeProvider"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface DashboardLayoutProps {
    children: ReactNode
}

const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Upload Dataset", href: "/upload", icon: Upload },
    { name: "Datasets", href: "/datasets", icon: Database },
    { name: "Settings", href: "/settings", icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const location = useLocation()
    const { sidebarCollapsed, toggleSidebar } = useAppStore()
    const { setTheme } = useTheme()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const isActive = (path: string) => {
        if (path === "/") {
            return location.pathname === "/"
        }
        return location.pathname.startsWith(path)
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300 hidden lg:block",
                    sidebarCollapsed ? "w-16" : "w-64"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center border-b px-4">
                        <motion.div
                            className="flex items-center gap-3"
                            layout
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                                <BarChart3 className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <AnimatePresence>
                                {!sidebarCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="text-lg font-bold gradient-text whitespace-nowrap"
                                    >
                                        ML Preprocessing
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
                        {navigation.map((item) => {
                            const active = isActive(item.href)
                            return (
                                <Link key={item.name} to={item.href}>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            variant={active ? "default" : "ghost"}
                                            className={cn(
                                                "w-full justify-start gap-3",
                                                sidebarCollapsed && "justify-center px-2"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5 shrink-0" />
                                            <AnimatePresence>
                                                {!sidebarCollapsed && (
                                                    <motion.span
                                                        initial={{ opacity: 0, width: 0 }}
                                                        animate={{ opacity: 1, width: "auto" }}
                                                        exit={{ opacity: 0, width: 0 }}
                                                        className="whitespace-nowrap"
                                                    >
                                                        {item.name}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </Button>
                                    </motion.div>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Collapse Toggle */}
                    <div className="border-t p-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleSidebar}
                            className="w-full"
                        >
                            <ChevronLeft
                                className={cn(
                                    "h-5 w-5 transition-transform",
                                    sidebarCollapsed && "rotate-180"
                                )}
                            />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="left" className="w-64 p-0">
                    <div className="flex h-full flex-col">
                        <div className="flex h-16 items-center border-b px-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                                    <BarChart3 className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <span className="text-lg font-bold gradient-text">
                                    ML Preprocessing
                                </span>
                            </div>
                        </div>

                        <nav className="flex-1 space-y-1 p-3">
                            {navigation.map((item) => {
                                const active = isActive(item.href)
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Button
                                            variant={active ? "default" : "ghost"}
                                            className="w-full justify-start gap-3"
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

            {/* Main Content */}
            <div
                className={cn(
                    "transition-all duration-300",
                    sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
                )}
            >
                {/* Top Navbar */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 lg:px-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </Button>

                    {/* Breadcrumbs */}
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                            {location.pathname === "/" && "Home"}
                            {location.pathname === "/upload" && "Upload Dataset"}
                            {location.pathname.startsWith("/preprocessing/") && "Preprocessing"}
                            {location.pathname.startsWith("/dashboard/") && "EDA Dashboard"}
                            {location.pathname === "/datasets" && "Datasets"}
                            {location.pathname === "/settings" && "Settings"}
                        </p>
                    </div>

                    {/* Theme Toggle */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")}>
                                System
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Avatar>
                                    <AvatarFallback>ML</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                Settings
                            </DropdownMenuItem>
                            <Separator className="my-1" />
                            <DropdownMenuItem>
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                {/* Page Content */}
                <main className="flex-1">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="container mx-auto p-6 lg:p-8"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    )
}
