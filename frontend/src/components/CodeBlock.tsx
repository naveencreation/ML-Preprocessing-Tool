import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Copy, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CodeBlockProps {
    code: string
    language?: string
    filename?: string
    showDownload?: boolean
    className?: string
}

export default function CodeBlock({
    code,
    language = "python",
    filename = "preprocessing.py",
    showDownload = true,
    className = ""
}: CodeBlockProps) {
    const [copied, setCopied] = useState(false)
    const { toast } = useToast()

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            toast({
                title: "Copied!",
                description: "Code copied to clipboard",
            })
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast({
                title: "Failed to copy",
                description: "Please try again",
                variant: "destructive"
            })
        }
    }

    const downloadCode = () => {
        const blob = new Blob([code], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
            title: "Downloaded!",
            description: `Saved as ${filename}`,
        })
    }

    return (
        <Card className={`relative ${className}`}>
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
                <span className="text-sm font-mono text-muted-foreground">
                    {language}
                </span>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        className="h-8"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-1" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-1" />
                                Copy
                            </>
                        )}
                    </Button>
                    {showDownload && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={downloadCode}
                            className="h-8"
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                        </Button>
                    )}
                </div>
            </div>
            <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono">
                    <code className="language-python">{code}</code>
                </pre>
            </div>
        </Card>
    )
}
