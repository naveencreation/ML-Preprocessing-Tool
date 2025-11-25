import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
                    <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
                        <AlertTriangle className="h-12 w-12" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold tracking-tight">Something went wrong</h1>
                    <p className="mb-6 max-w-md text-muted-foreground">
                        We apologize for the inconvenience. An unexpected error has occurred.
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={() => window.location.reload()}>Reload Page</Button>
                        <Button variant="outline" onClick={() => window.location.href = "/"}>
                            Go Home
                        </Button>
                    </div>
                    {import.meta.env.DEV && this.state.error && (
                        <div className="mt-8 w-full max-w-2xl overflow-auto rounded-lg bg-muted p-4 text-left font-mono text-xs">
                            {this.state.error.toString()}
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
