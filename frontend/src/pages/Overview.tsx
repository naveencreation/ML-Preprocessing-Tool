import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import {
    ArrowRight,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Lightbulb,
    Sparkles,
    TrendingUp,
    Zap,
    Database
} from "lucide-react"
import { DATA_TYPES } from "@/lib/data-types"


const whyPreprocessing = [
    {
        icon: CheckCircle2,
        title: "Better Model Performance",
        description: "Clean, well-prepared data leads to more accurate predictions and better generalization.",
        color: "text-green-500"
    },
    {
        icon: Zap,
        title: "Faster Training",
        description: "Normalized and properly scaled data helps models converge faster during training.",
        color: "text-yellow-500"
    },
    {
        icon: TrendingUp,
        title: "Reliable Insights",
        description: "Remove noise and outliers to ensure your analysis reflects true patterns.",
        color: "text-blue-500"
    }
]

const whatIfSkip = [
    {
        icon: XCircle,
        title: "Poor Accuracy",
        description: "Models trained on raw data often fail to capture important patterns.",
        example: "A recommendation system with unscaled features may ignore important signals."
    },
    {
        icon: AlertTriangle,
        title: "Training Failures",
        description: "Missing values, incorrect types, or extreme outliers can cause models to crash or diverge.",
        example: "Neural networks can't process NaN values and will throw errors."
    },
    {
        icon: XCircle,
        title: "Biased Results",
        description: "Unhandled imbalances and inconsistencies lead to biased, unfair predictions.",
        example: "A medical diagnosis model trained on imbalanced data might ignore rare diseases."
    }
]

export default function Overview() {
    return (
        <div className="space-y-16 pb-12">
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-accent/10 border border-primary/20 shadow-xl p-12 text-center"
            >
                <div className="relative z-10 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mb-6 flex justify-center"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-md border border-primary/30 px-5 py-2 text-sm font-medium text-primary shadow-lg">
                            <Sparkles className="h-5 w-5" />
                            <span>Welcome to Data Preprocessing</span>
                        </div>
                    </motion.div>

                    <h1 className="mb-6 text-5xl font-bold tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-accent">
                        What is Data Preprocessing?
                    </h1>

                    <p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground leading-relaxed">
                        Data preprocessing is the crucial step of transforming raw data into a clean,
                        structured format that machine learning models can understand. It's like preparing
                        ingredients before cooking—the quality of your preparation directly impacts the final dish.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link to="/upload">
                            <Button size="lg" className="h-12 px-8 rounded-full gap-2 text-base shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all">
                                Start Preprocessing
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/datasets">
                            <Button variant="outline" size="lg" className="h-12 px-8 rounded-full border-primary/30 hover:bg-primary/5 text-base">
                                View My Datasets
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[400px] w-[400px] rounded-full bg-primary/20 blur-[120px] opacity-40 pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[120px] opacity-40 pointer-events-none" />
            </motion.section>

            {/* Why Preprocessing Matters */}
            <section>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8 text-center"
                >
                    <div className="inline-flex items-center gap-2 mb-4 text-primary">
                        <Lightbulb className="h-6 w-6" />
                        <h2 className="text-3xl font-bold">Why Preprocessing Matters</h2>
                    </div>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Raw data is rarely ready for machine learning. Here's why preprocessing is essential.
                    </p>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    {whyPreprocessing.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                        >
                            <Card className="h-full border-border/50 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md">
                                <CardHeader>
                                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                        <item.icon className={`h-6 w-6 ${item.color}`} />
                                    </div>
                                    <CardTitle className="text-xl">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base leading-relaxed">
                                        {item.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* What if you skip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-12"
                >
                    <Card className="border-destructive/30 bg-destructive/5">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                </div>
                                <CardTitle className="text-2xl">What Happens If You Skip Preprocessing?</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                {whatIfSkip.map((item) => (
                                    <div key={item.title} className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <item.icon className="h-5 w-5 text-destructive flex-shrink-0" />
                                            <h4 className="font-semibold">{item.title}</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                        <p className="text-xs text-muted-foreground italic bg-muted/50 p-2 rounded">
                                            💡 {item.example}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </section>

            {/* Supported Data Types */}
            <section>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mb-8 text-center"
                >
                    <h2 className="text-3xl font-bold mb-4">Supported Data Types</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        We support preprocessing for 6 different types of data, each with specialized workflows.
                    </p>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {DATA_TYPES.map((type, index) => (
                        <motion.div
                            key={type.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.9 + index * 0.05 }}
                            whileHover={{ y: -5 }}
                        >
                            <Card className="h-full border-border/50 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden">
                                {type.comingSoon && (
                                    <div className="absolute top-3 right-3 z-10">
                                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30">
                                            Coming Soon
                                        </Badge>
                                    </div>
                                )}
                                <CardHeader>
                                    <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${type.bgColor}`}>
                                        <type.icon className={`h-7 w-7 ${type.color}`} />
                                    </div>
                                    <CardTitle className="text-xl">{type.title}</CardTitle>
                                    <CardDescription className="text-sm">{type.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-2">Supported Formats</p>
                                        <Badge variant="outline" className="text-xs">
                                            {type.fileTypes}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-2">Typical Steps</p>
                                        <div className="flex flex-wrap gap-1">
                                            {type.steps.slice(0, 3).map((step) => (
                                                <Badge key={step} variant="secondary" className="text-xs">
                                                    {step}
                                                </Badge>
                                            ))}
                                            {type.steps.length > 3 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    +{type.steps.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Preprocessing Journey */}
            <section>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="text-center"
                >
                    <h2 className="text-3xl font-bold mb-4">Your Preprocessing Journey</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                        Follow these simple steps to transform your raw data into model-ready datasets.
                    </p>

                    <div className="grid gap-6 md:grid-cols-4 max-w-5xl mx-auto">
                        {[
                            { num: "1", title: "Upload", desc: "Choose your data type and upload your file", icon: Database },
                            { num: "2", title: "Explore", desc: "View data quality insights and statistics", icon: Lightbulb },
                            { num: "3", title: "Transform", desc: "Apply preprocessing steps with guidance", icon: Zap },
                            { num: "4", title: "Export", desc: "Download cleaned data or Python code", icon: ArrowRight }
                        ].map((step, index) => (
                            <div key={step.num} className="relative">
                                <Card className="border-primary/20 bg-card/50 backdrop-blur-sm hover:bg-card transition-all">
                                    <CardHeader className="text-center pb-3">
                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                                            {step.num}
                                        </div>
                                        <CardTitle className="text-lg">{step.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        <CardDescription className="text-sm">
                                            {step.desc}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                                {index < 3 && (
                                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                                        <ArrowRight className="h-6 w-6 text-primary/40" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-10">
                        <Link to="/upload">
                            <Button size="lg" className="h-12 px-10 rounded-full gap-2 shadow-lg shadow-primary/30">
                                Get Started Now
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    )
}
