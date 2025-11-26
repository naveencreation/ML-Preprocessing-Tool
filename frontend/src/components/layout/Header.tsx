import { useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    Menu,
    Moon,
    Sun,
    Bell,
    Search
} from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

interface HeaderProps {
    onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
    const location = useLocation()
    const { setTheme } = useTheme()

    const getPageTitle = () => {
        if (location.pathname === "/") return "Dashboard"
        if (location.pathname === "/upload") return "Upload Dataset"
        if (location.pathname.startsWith("/preprocessing/")) return "Preprocessing Pipeline"
        if (location.pathname.startsWith("/dashboard/")) return "EDA Dashboard"
        if (location.pathname === "/datasets") return "Dataset Manager"
        if (location.pathname === "/workflows") return "Workflow Templates"
        if (location.pathname === "/logs") return "Processing Logs"
        if (location.pathname === "/settings") return "Settings"
        return "ML Studio"
    }

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-border/40 bg-background/80 backdrop-blur-xl px-6 lg:px-8 transition-all">
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onMenuClick}
            >
                <Menu className="h-6 w-6" />
            </Button>

            {/* Page Title & Breadcrumbs */}
            <div className="flex-1 flex flex-col justify-center">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                    {getPageTitle()}
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                    ML Preprocessing Tool / {getPageTitle()}
                </p>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search datasets..."
                    className="pl-9 bg-muted/30 border-transparent focus:bg-background focus:border-primary/50 transition-all rounded-full h-9"
                />
            </div>

            <div className="flex items-center gap-2">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                </Button>

                {/* Theme Toggle */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
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

                <Separator orientation="vertical" className="h-8 mx-2" />

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="rounded-full pl-2 pr-4 gap-3 h-10 hover:bg-muted/50">
                            <Avatar className="h-8 w-8 border-2 border-primary/20">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">DS</AvatarFallback>
                            </Avatar>
                            <div className="hidden md:flex flex-col items-start text-sm">
                                <span className="font-medium">Data Scientist</span>
                                <span className="text-xs text-muted-foreground">Pro Plan</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <Separator className="my-1" />
                        <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
