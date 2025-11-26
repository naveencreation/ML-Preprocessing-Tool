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
    ArrowRight,
    Activity
} from "lucide-react"

const features = [
    {
        icon: Upload,
        title: "Easy Data Upload",
        description: "Drag and drop your CSV files or browse to upload. Supports datasets up to 100MB.",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10"
    },
    {
        icon: Zap,
        title: "Automated Preprocessing",
        description: "Handle missing values, encode categorical data, and scale features with just a few clicks.",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10"
    },
    {
        icon: BarChart3,
        title: "Visual Analytics",
        description: "Explore your data with interactive charts, correlation heatmaps, and distribution plots.",
        color: "text-teal-500",
        bgColor: "bg-teal-500/10"
    },
    {
        icon: Database,
        title: "Dataset Management",
        description: "Keep track of all your datasets in one place. View, download, or reprocess anytime.",
        color: "text-green-500",
        bgColor: "bg-green-500/10"
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
        <div className="space-y-12">
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-accent/5 to-background border border-white/20 shadow-xl p-12 text-center"
            >
                <div className="relative z-10 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mb-8 flex justify-center"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-background/50 backdrop-blur-md border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
                            <Sparkles className="h-4 w-4" />
                            <span>AI-Powered Data Preprocessing</span>
                        </div>
                    </motion.div>

                    <h1 className="mb-6 text-5xl font-bold tracking-tight lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-accent">
                        Transform Your Data
                        <br />
                        With Confidence
                    </h1>

                    <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                        Streamline your machine learning workflow with automated data preprocessing,
                        exploratory analysis, and beautiful visualizations. Get your data ready
                        for modeling in minutes, not hours.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link to="/upload">
                            <Button size="lg" className="h-12 px-8 rounded-full gap-2 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                                Get Started
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button variant="outline" size="lg" className="h-12 px-8 rounded-full border-primary/20 hover:bg-primary/5 text-base">
                            View Demo
                        </Button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px] opacity-50 pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[100px] opacity-50 pointer-events-none" />
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
                    <p className="text-muted-foreground text-lg">
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
                            whileHover={{ y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Card className="h-full border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md">
                                <CardHeader>
                                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor}`}>
                                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base">{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Recent Activity (Mock) */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Recent Activity
                    </h2>
                    <Button variant="ghost" className="text-primary">View All</Button>
                </div>
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="flex items-center p-4 gap-4 hover:bg-muted/30 transition-colors cursor-pointer border-border/40">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                DS
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium">housing_prices_v{i}.csv</h4>
                                <p className="text-sm text-muted-foreground">Processed 2 hours ago • 15k rows</p>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-full">Resume</Button>
                        </Card>
                    ))}
                </div>
            </motion.section>
        </div>
    )
}
