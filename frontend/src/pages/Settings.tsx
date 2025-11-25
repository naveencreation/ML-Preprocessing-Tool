import { useState } from "react"
import PageHeader from "@/components/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ThemeProvider"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import {
    Palette,
    Database,
    Info,
    Save
} from "lucide-react"

export default function Settings() {
    const { theme, setTheme } = useTheme()
    const { toast } = useToast()
    const { defaultPreprocessingOptions, setDefaultPreprocessingOptions } = useAppStore()

    const [tempOptions, setTempOptions] = useState(defaultPreprocessingOptions)

    const handleSave = () => {
        setDefaultPreprocessingOptions(tempOptions)
        toast({
            title: "Settings Saved",
            description: "Your preferences have been updated successfully.",
        })
    }

    const handleReset = () => {
        const defaults = {
            missing_option: "Fill with Mean",
            encoding_method: "Label Encoding",
            scaling_method: "StandardScaler"
        }
        setTempOptions(defaults)
        setDefaultPreprocessingOptions(defaults)
        toast({
            title: "Settings Reset",
            description: "All settings have been reset to defaults.",
        })
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Settings"
                description="Customize your preferences and default options"
            />

            <div className="grid gap-6 max-w-4xl">
                {/* Appearance Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <Palette className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>Appearance</CardTitle>
                                    <CardDescription>
                                        Customize the look and feel of the application
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="theme">Theme</Label>
                                <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                                    <SelectTrigger id="theme">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Choose your preferred color theme
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Default Preprocessing Options */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-accent/10 p-2">
                                    <Database className="h-5 w-5 text-accent" />
                                </div>
                                <div>
                                    <CardTitle>Default Preprocessing Options</CardTitle>
                                    <CardDescription>
                                        Set default values for new preprocessing tasks
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="missing">Missing Values Handling</Label>
                                <Select
                                    value={tempOptions.missing_option}
                                    onValueChange={(value) => setTempOptions({ ...tempOptions, missing_option: value })}
                                >
                                    <SelectTrigger id="missing">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Drop Rows">Drop Rows</SelectItem>
                                        <SelectItem value="Fill with Mean">Fill with Mean</SelectItem>
                                        <SelectItem value="Fill with Median">Fill with Median</SelectItem>
                                        <SelectItem value="Fill with Mode">Fill with Mode</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Default method for handling missing values
                                </p>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="encoding">Categorical Encoding</Label>
                                <Select
                                    value={tempOptions.encoding_method}
                                    onValueChange={(value) => setTempOptions({ ...tempOptions, encoding_method: value })}
                                >
                                    <SelectTrigger id="encoding">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Label Encoding">Label Encoding</SelectItem>
                                        <SelectItem value="One-Hot Encoding">One-Hot Encoding</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Default method for encoding categorical variables
                                </p>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="scaling">Feature Scaling</Label>
                                <Select
                                    value={tempOptions.scaling_method}
                                    onValueChange={(value) => setTempOptions({ ...tempOptions, scaling_method: value })}
                                >
                                    <SelectTrigger id="scaling">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="StandardScaler">Standard Scaler</SelectItem>
                                        <SelectItem value="MinMaxScaler">Min-Max Scaler</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Default method for scaling numeric features
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* About */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-muted p-2">
                                    <Info className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle>About</CardTitle>
                                    <CardDescription>
                                        Application information and version
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Application</span>
                                <span className="font-medium">ML Preprocessing Tool</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Version</span>
                                <span className="font-medium">1.0.0</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Framework</span>
                                <span className="font-medium">React 19 + TypeScript</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">UI Library</span>
                                <span className="font-medium">shadcn/ui + Tailwind CSS</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                    </Button>
                    <Button onClick={handleReset} variant="outline">
                        Reset to Defaults
                    </Button>
                </div>
            </div>
        </div>
    )
}
