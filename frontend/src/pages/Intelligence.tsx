import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useParams, Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import {
    Brain,
    Target,
    BarChart3,
    Sparkles,
    AlertTriangle,
    CheckCircle2,
    ArrowLeft,
    RefreshCw,
    MessageSquare,
    Send,
    Loader2,
    ChevronDown,
    ChevronUp
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const API_BASE = "http://localhost:8000"

interface ColumnProfile {
    name: string
    dtype: string
    inferred_type: string
    missing_ratio: number
    unique_count: number
    preprocessing_hints: string[]
}

interface QualityIssue {
    issue_type: string
    column: string | null
    severity: string
    description: string
    recommendation: string
}

interface TargetCandidate {
    column: string
    confidence: number
    problem_type: string
    reasons: string[]
    warnings: string[]
}

interface MetricRecommendation {
    name: string
    category: string
    description: string
    when_to_use: string
}

interface Insight {
    category: string
    title: string
    description: string
}

interface FullAnalysis {
    schema: {
        row_count: number
        column_count: number
        columns: ColumnProfile[]
        numeric_columns: string[]
        categorical_columns: string[]
    }
    quality: {
        quality_score: number
        quality_issues: QualityIssue[]
        duplicate_ratio: number
        overall_missing_ratio: number
    }
    targets: {
        candidates: TargetCandidate[]
        unsupervised_suggested: boolean
        unsupervised_tasks: string[]
    }
    metrics: {
        primary_metric: string
        metrics: MetricRecommendation[]
    } | null
    insights: {
        insights: Insight[]
        feature_correlations: Array<{ feature: string, correlation: number }>
    }
    effective_target: string | null
}

export default function Intelligence() {
    const { datasetId } = useParams<{ datasetId: string }>()
    const [analysis, setAnalysis] = useState<FullAnalysis | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [question, setQuestion] = useState("")
    const [chatHistory, setChatHistory] = useState<Array<{ role: string, content: string }>>([])
    const [askingLLM, setAskingLLM] = useState(false)
    const [schemaOpen, setSchemaOpen] = useState(false)

    useEffect(() => {
        fetchAnalysis()
    }, [datasetId])

    const fetchAnalysis = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${API_BASE}/intelligence/${datasetId}/full-analysis`)
            if (!res.ok) throw new Error(await res.text())
            const data = await res.json()
            setAnalysis(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to analyze dataset")
        } finally {
            setLoading(false)
        }
    }

    const askQuestion = async () => {
        if (!question.trim()) return
        setAskingLLM(true)
        setChatHistory(prev => [...prev, { role: "user", content: question }])
        try {
            const res = await fetch(`${API_BASE}/intelligence/${datasetId}/ask?question=${encodeURIComponent(question)}`, { method: "POST" })
            const data = await res.json()
            setChatHistory(prev => [...prev, { role: "assistant", content: data.success ? data.answer : `⚠️ ${data.error}` }])
        } catch {
            setChatHistory(prev => [...prev, { role: "assistant", content: "Failed to get response" }])
        } finally {
            setAskingLLM(false)
            setQuestion("")
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical": return "bg-red-500"
            case "high": return "bg-orange-500"
            case "medium": return "bg-yellow-500"
            default: return "bg-blue-500"
        }
    }

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.7) return "text-green-600"
        if (confidence >= 0.4) return "text-yellow-600"
        return "text-red-600"
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Analyzing dataset...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                            <div>
                                <h3 className="font-semibold text-red-700">Analysis Failed</h3>
                                <p className="text-red-600">{error}</p>
                            </div>
                        </div>
                        <Button className="mt-4" onClick={fetchAnalysis}><RefreshCw className="w-4 h-4 mr-2" /> Retry</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!analysis) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-purple-950">
            <div className="container mx-auto py-8 px-4 max-w-6xl">
                <div className="flex items-center gap-4 mb-8">
                    <Link to={`/dashboard/${datasetId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button></Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold flex items-center gap-3"><Brain className="w-8 h-8 text-purple-600" />Dataset Intelligence</h1>
                        <p className="text-muted-foreground">AI-powered analysis • {analysis.schema.row_count.toLocaleString()} rows • {analysis.schema.column_count} columns</p>
                    </div>
                    <Button onClick={fetchAnalysis} variant="outline"><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-200 text-sm uppercase tracking-wide">Data Quality Score</p>
                                    <p className="text-5xl font-bold">{analysis.quality.quality_score}/100</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-purple-200">Best Target</p>
                                    <p className="text-2xl font-semibold">{analysis.effective_target || "None detected"}</p>
                                    {analysis.targets.candidates[0] && <Badge variant="secondary" className="mt-1">{analysis.targets.candidates[0].problem_type.replace("_", " ")}</Badge>}
                                </div>
                            </div>
                            <Progress value={analysis.quality.quality_score} className="mt-4 bg-purple-400" />
                        </CardContent>
                    </Card>
                </motion.div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="quality">Quality</TabsTrigger>
                        <TabsTrigger value="targets">Targets</TabsTrigger>
                        <TabsTrigger value="insights">Insights</TabsTrigger>
                        <TabsTrigger value="ask">Ask AI</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Numeric Features</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{analysis.schema.numeric_columns.length}</p></CardContent></Card>
                            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Categorical Features</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{analysis.schema.categorical_columns.length}</p></CardContent></Card>
                            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Missing Data</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{(analysis.quality.overall_missing_ratio * 100).toFixed(1)}%</p></CardContent></Card>
                        </div>
                        <Collapsible open={schemaOpen} onOpenChange={setSchemaOpen}>
                            <Card>
                                <CollapsibleTrigger asChild><CardHeader className="cursor-pointer hover:bg-muted/50"><div className="flex items-center justify-between"><CardTitle className="text-lg">Column Profiles</CardTitle>{schemaOpen ? <ChevronUp /> : <ChevronDown />}</div></CardHeader></CollapsibleTrigger>
                                <CollapsibleContent>
                                    <CardContent>
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {analysis.schema.columns.map((col) => (
                                                <div key={col.name} className="p-3 bg-muted/50 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <div><span className="font-medium">{col.name}</span><Badge variant="outline" className="ml-2">{col.inferred_type}</Badge></div>
                                                        <div className="text-sm text-muted-foreground">{col.unique_count} unique • {(col.missing_ratio * 100).toFixed(1)}% missing</div>
                                                    </div>
                                                    {col.preprocessing_hints.length > 0 && <p className="text-sm text-amber-600 mt-1">💡 {col.preprocessing_hints[0]}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>
                    </TabsContent>

                    <TabsContent value="quality">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Quality Issues ({analysis.quality.quality_issues.length})</CardTitle></CardHeader>
                            <CardContent>
                                {analysis.quality.quality_issues.length === 0 ? (
                                    <div className="text-center py-8 text-green-600"><CheckCircle2 className="w-12 h-12 mx-auto mb-2" /><p>No major quality issues detected!</p></div>
                                ) : (
                                    <div className="space-y-3">
                                        {analysis.quality.quality_issues.map((issue, idx) => (
                                            <div key={idx} className="p-4 border rounded-lg">
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(issue.severity)}`} />
                                                    <div className="flex-1"><p className="font-medium">{issue.column ? `${issue.column}: ` : ""}{issue.description}</p><p className="text-sm text-muted-foreground mt-1">💡 {issue.recommendation}</p></div>
                                                    <Badge variant="outline">{issue.severity}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="targets" className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" />Target Column Candidates</CardTitle><CardDescription>Ranked by confidence</CardDescription></CardHeader>
                            <CardContent>
                                {analysis.targets.candidates.length === 0 ? (
                                    <div className="text-center py-8"><p className="text-muted-foreground mb-4">No supervised target detected</p>{analysis.targets.unsupervised_tasks.length > 0 && <div><p className="font-medium mb-2">Consider unsupervised learning:</p><div className="flex flex-wrap gap-2 justify-center">{analysis.targets.unsupervised_tasks.map((task) => <Badge key={task} variant="secondary">{task}</Badge>)}</div></div>}</div>
                                ) : (
                                    <div className="space-y-4">
                                        {analysis.targets.candidates.map((candidate, idx) => (
                                            <div key={idx} className={`p-4 border rounded-lg ${idx === 0 ? 'border-purple-300 bg-purple-50 dark:bg-purple-950/20' : ''}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">{idx === 0 && <Sparkles className="w-5 h-5 text-purple-600" />}<span className="font-semibold text-lg">{candidate.column}</span><Badge>{candidate.problem_type.replace("_", " ")}</Badge></div>
                                                    <span className={`font-bold ${getConfidenceColor(candidate.confidence)}`}>{(candidate.confidence * 100).toFixed(0)}%</span>
                                                </div>
                                                <ul className="text-sm text-muted-foreground list-disc list-inside">{candidate.reasons.map((reason, i) => <li key={i}>{reason}</li>)}</ul>
                                                {candidate.warnings.length > 0 && <div className="mt-2">{candidate.warnings.map((warn, i) => <p key={i} className="text-sm text-amber-600">⚠️ {warn}</p>)}</div>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        {analysis.metrics && (
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Recommended Metrics</CardTitle><CardDescription>Primary: <span className="font-semibold text-foreground">{analysis.metrics.primary_metric}</span></CardDescription></CardHeader>
                                <CardContent><div className="grid gap-3">{analysis.metrics.metrics.map((metric) => <div key={metric.name} className="p-3 bg-muted/50 rounded-lg"><div className="flex items-center gap-2 mb-1"><span className="font-medium">{metric.name}</span><Badge variant="outline" className="text-xs">{metric.category}</Badge></div><p className="text-sm text-muted-foreground">{metric.description}</p><p className="text-xs text-green-600 mt-1">✓ {metric.when_to_use}</p></div>)}</div></CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5" />Key Insights</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-3">{analysis.insights.insights.map((insight, idx) => (
                                    <div key={idx} className="p-4 border rounded-lg"><div className="flex items-start gap-3"><Badge variant={insight.category === "warning" ? "destructive" : insight.category === "recommendation" ? "default" : "secondary"}>{insight.category}</Badge><div><p className="font-medium">{insight.title}</p><p className="text-sm text-muted-foreground">{insight.description}</p></div></div></div>
                                ))}</div>
                            </CardContent>
                        </Card>
                        {analysis.insights.feature_correlations.length > 0 && (
                            <Card><CardHeader><CardTitle>Top Feature Correlations</CardTitle></CardHeader><CardContent><div className="space-y-2">{analysis.insights.feature_correlations.slice(0, 10).map((fc) => <div key={fc.feature} className="flex items-center gap-4"><span className="w-32 truncate font-medium">{fc.feature}</span><div className="flex-1 h-4 bg-muted rounded-full overflow-hidden"><div className={`h-full ${fc.correlation >= 0 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.abs(fc.correlation) * 100}%` }} /></div><span className="w-16 text-right font-mono text-sm">{fc.correlation.toFixed(3)}</span></div>)}</div></CardContent></Card>
                        )}
                    </TabsContent>

                    <TabsContent value="ask">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" />Ask AI About Your Data</CardTitle><CardDescription>Powered by Gemini 2.5 Flash</CardDescription></CardHeader>
                            <CardContent>
                                <div className="min-h-[200px] max-h-[400px] overflow-y-auto mb-4 space-y-3">
                                    {chatHistory.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>Ask anything about your dataset!</p>
                                            <p className="text-sm">e.g., "What columns should I use as features?"</p>
                                        </div>
                                    ) : chatHistory.map((msg, idx) => (
                                        <div key={idx} className={`p-4 rounded-lg ${msg.role === "user" ? "bg-primary text-primary-foreground ml-12" : "bg-muted mr-4"}`}>
                                            {msg.role === "user" ? (
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            ) : (
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {askingLLM && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span>Thinking...</span></div>}
                                </div>
                                <div className="flex gap-2"><Textarea placeholder="Ask a question..." value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askQuestion() } }} className="min-h-[60px]" /><Button onClick={askQuestion} disabled={askingLLM || !question.trim()}><Send className="w-4 h-4" /></Button></div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
