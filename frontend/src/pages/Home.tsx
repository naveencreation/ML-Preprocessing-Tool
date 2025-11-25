import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
    Upload,
    Zap,
    BarChart3,
    Shield,
    Database,
    Sparkles,
    ArrowRight
} from "lucide-react"

const features = [
    {
        icon: Upload,
        title: "Easy Data Upload",
        description: "Drag and drop your CSV files or browse to upload. Supports datasets up to 100MB.",
        color: "text-blue-600",
        bgColor: "bg-blue-100/50 dark:bg-blue-900/20"
    },
    {
        icon: Zap,
        title: "Automated Preprocessing",
        description: "Handle missing values, encode categorical data, and scale features with just a few clicks.",
        color: "text-purple-600",
        bgColor: "bg-purple-100/50 dark:bg-purple-900/20"
    },
    {
        icon: BarChart3,
        title: "Visual Analytics",
        description: "Explore your data with interactive charts, correlation heatmaps, and distribution plots.",
        color: "text-teal-600",
        bgColor: "bg-teal-100/50 dark:bg-teal-900/20"
    },
    {
        icon: Database,
        title: "Dataset Management",
        description: "Keep track of all your datasets in one place. View, download, or reprocess anytime.",
        color: "text-green-600",
        bgColor: "bg-green-100/50 dark:bg-green-900/20"
    }
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 }
    }
}

export default function Home() {
    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-12 text-center"
            >
                <div className="relative z-10">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mb-6 flex justify-center"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                            <Sparkles className="h-4 w-4" />
                            AI-Powered Data Preprocessing
                        </div>
                    </motion.div>

                    <h1 className="mb-6 text-5xl font-bold tracking-tight lg:text-6xl">
                        Transform Your Data
                        <br />
                        <span className="gradient-text">With Confidence</span>
                    </h1>

                    <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                        Streamline your machine learning workflow with automated data preprocessing,
                        exploratory analysis, and beautiful visualizations. Get your data ready
                        for modeling in minutes, not hours.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link to="/upload">
                            <Button size="lg" className="gap-2 group">
                                Get Started
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                        <Button variant="outline" size="lg">
                            View Demo
                        </Button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
            </motion.section>

            {/* Features Grid */}
            <section>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12 text-center"
                >
                    <h2 className="mb-4 text-3xl font-bold">Everything You Need</h2>
                    <p className="text-muted-foreground">
                        Powerful features to make data preprocessing effortless
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.title}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, translateY: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Card className="h-full border-2 transition-colors hover:border-primary/50">
                                <CardHeader>
                                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor}`}>
                                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Quick Start Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-muted/20">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
                        <CardDescription className="text-base">
                            Upload your first dataset and see the magic happen
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Link to="/upload">
                            <Button size="lg" className="gap-2 group">
                                <Upload className="h-5 w-5" />
                                Upload Your Dataset
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </motion.section>

            {/* Stats Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid gap-8 md:grid-cols-3"
            >
                {[
                    { label: "Processing Speed", value: "10x Faster", icon: Zap },
                    { label: "Data Safety", value: "100% Secure", icon: Shield },
                    { label: "Accuracy", value: "99.9%", icon: Sparkles }
                ].map((stat) => (
                    <Card key={stat.label} className="text-center">
                        <CardHeader>
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <stat.icon className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-4xl font-bold gradient-text">{stat.value}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </motion.section>
        </div>
    )
}
