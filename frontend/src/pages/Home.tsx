import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
    Upload,
    Zap,
    BarChart3,
    Database,
    Sparkles,
    ArrowRight,
    Activity,
    CheckCircle2,
    FileSpreadsheet
} from "lucide-react"

const features = [
    {
        icon: Upload,
        title: "Easy Data Upload",
        description: "Drag and drop your CSV files or browse to upload. Supports datasets up to 100MB.",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "group-hover:border-blue-500/50"
    },
    {
        icon: Zap,
        title: "Automated Preprocessing",
        description: "Handle missing values, encode categorical data, and scale features with just a few clicks.",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        borderColor: "group-hover:border-purple-500/50"
    },
    {
        icon: BarChart3,
        title: "Visual Analytics",
        description: "Explore your data with interactive charts, correlation heatmaps, and distribution plots.",
        color: "text-teal-500",
        bgColor: "bg-teal-500/10",
        borderColor: "group-hover:border-teal-500/50"
    },
    {
        icon: Database,
        title: "Dataset Management",
        description: "Keep track of all your datasets in one place. View, download, or reprocess anytime.",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "group-hover:border-green-500/50"
    }
]

const stats = [
    { value: "6+", label: "Data Types", icon: FileSpreadsheet },
    { value: "20+", label: "Preprocessing Steps", icon: Zap },
    { value: "100%", label: "Open Source", icon: CheckCircle2 },
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6 }
    }
}

export default function Home() {
    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
            >
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />

                {/* Floating Orbs */}
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 right-20 h-64 w-64 rounded-full bg-blue-500/30 blur-[80px]"
                />
                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute bottom-20 left-20 h-72 w-72 rounded-full bg-purple-500/30 blur-[80px]"
                />

                <div className="relative z-10 px-8 py-20 text-center lg:py-28">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mb-8 flex justify-center"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2 text-sm font-medium text-white shadow-lg">
                            <Sparkles className="h-4 w-4 text-yellow-400" />
                            <span>AI-Powered Data Preprocessing</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="mb-6 text-5xl font-extrabold tracking-tight text-white lg:text-7xl"
                    >
                        Transform Your Data
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            With Confidence
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="mx-auto mb-10 max-w-2xl text-lg text-white/70 leading-relaxed"
                    >
                        Streamline your machine learning workflow with automated data preprocessing,
                        exploratory analysis, and beautiful visualizations.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                    >
                        <Link to="/upload">
                            <Button size="lg" className="h-14 px-10 rounded-full gap-2 text-base font-semibold bg-white text-slate-900 hover:bg-white/90 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                Get Started Free
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/overview">
                            <Button variant="outline" size="lg" className="h-14 px-10 rounded-full border-white/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 text-base font-semibold transition-all duration-300">
                                Learn More
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Stats Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="mt-16 flex flex-wrap justify-center gap-8 lg:gap-16"
                    >
                        {stats.map((stat) => (
                            <div key={stat.label} className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                    <div className="text-sm text-white/60">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            {/* Features Grid */}
            <section>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12 text-center"
                >
                    <h2 className="mb-4 text-3xl font-bold lg:text-4xl">Everything You Need</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Powerful features to make data preprocessing effortless and intuitive
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
                            whileHover={{ y: -8, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="group"
                        >
                            <Card className={`h-full border-2 border-border/50 bg-gradient-to-b from-card to-card/50 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl ${feature.borderColor}`}>
                                <CardHeader>
                                    <motion.div
                                        className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bgColor} transition-transform duration-300 group-hover:scale-110`}
                                    >
                                        <feature.icon className={`h-7 w-7 ${feature.color}`} />
                                    </motion.div>
                                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Quick Actions */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Activity className="h-5 w-5 text-primary" />
                        </div>
                        Quick Actions
                    </h2>
                    <Link to="/datasets">
                        <Button variant="ghost" className="text-primary gap-2">
                            View All Datasets
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <Link to="/upload" className="block group">
                        <Card className="h-full flex items-center p-6 gap-4 border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer">
                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg">Upload New Dataset</h4>
                                <p className="text-sm text-muted-foreground">Start preprocessing a new file</p>
                            </div>
                        </Card>
                    </Link>
                    <Link to="/datasets" className="block group">
                        <Card className="h-full flex items-center p-6 gap-4 border-2 border-border/50 hover:border-green-500/50 hover:bg-green-500/5 transition-all duration-300 cursor-pointer">
                            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Database className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg">Browse Datasets</h4>
                                <p className="text-sm text-muted-foreground">View and manage your data</p>
                            </div>
                        </Card>
                    </Link>
                    <Link to="/overview" className="block group">
                        <Card className="h-full flex items-center p-6 gap-4 border-2 border-border/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300 cursor-pointer">
                            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BarChart3 className="h-6 w-6 text-purple-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg">Learn Platform</h4>
                                <p className="text-sm text-muted-foreground">Explore features and guides</p>
                            </div>
                        </Card>
                    </Link>
                </div>
            </motion.section>
        </div>
    )
}

