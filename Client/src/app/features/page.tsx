"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
    Video,
    Clock,
    Users,
    BookOpen,
    Shield,
    ArrowRight,
    FileText,
    Zap,
    Globe,
    Award,
    MessageSquare,
    Headphones,
    Monitor,
    Smartphone,
    CheckCircle,
    Star,
    TrendingUp,
    Brain,
    Target,
    Lightbulb,
    Palette,
    BarChart3,
    Calendar,
    CreditCard,
    Lock,
    Wifi,
    PlayCircle,
} from "lucide-react"

const mainFeatures = [
    {
        icon: Video,
        title: "HD Video Sessions",
        description:
            "Crystal-clear video calls with professional-grade audio quality for seamless learning experiences.",
        details: [
            "1080p HD video quality",
            "Noise cancellation technology",
            "Low-latency communication",
            "Multi-device support",
        ],
    },
    {
        icon: FileText,
        title: "Interactive Whiteboard",
        description:
            "Advanced collaborative canvas with drawing tools, equation support, and real-time synchronization.",
        details: [
            "Real-time collaboration",
            "Mathematical equation support",
            "Drawing and annotation tools",
            "Save and share sessions",
        ],
    },
    {
        icon: Users,
        title: "Expert Tutors",
        description:
            "Expert educators with a track record of helping students thrive",
        details: [
            "Verified credentials",
            "Subject matter experts",
            "Continuous training",
            "Student feedback system",
        ],
    },
    {
        icon: Clock,
        title: "24/7 Availability",
        description:
            "Round-the-clock access to tutoring sessions and support whenever you need assistance.",
        details: [
            "Global tutor network",
            "Flexible scheduling",
            "Instant doubt resolution",
            "Emergency support",
        ],
    },
    {
        icon: BookOpen,
        title: "All Subjects",
        description:
            "Comprehensive coverage from elementary math to advanced university-level courses.",
        details: [
            "Mathematics & Sciences",
            "Programming & Technology",
            "Languages & Literature",
            "Business & Economics",
        ],
    },
]

const additionalFeatures = [
    {
        icon: Monitor,
        title: "Screen Sharing",
        description:
            "Share your screen or specific applications for better problem-solving",
    },
    {
        icon: MessageSquare,
        title: "AI Assistant",
        description:
            "Get instant help with our intelligent chatbot for quick questions",
    },
    {
        icon: BarChart3,
        title: "Progress Tracking",
        description:
            "Monitor your learning journey with detailed analytics and insights",
    },
]

const subjects = [
    {
        name: "Mathematics",
        icon: "📐",
        courses: "Algebra, Calculus, Geometry, Statistics",
    },
    {
        name: "Physics",
        icon: "⚛️",
        courses: "Mechanics, Thermodynamics, Quantum Physics",
    },
    {
        name: "Chemistry",
        icon: "🧪",
        courses: "Organic, Inorganic, Physical Chemistry",
    },
    {
        name: "Biology",
        icon: "🧬",
        courses: "Cell Biology, Genetics, Ecology, Anatomy",
    },
    {
        name: "Computer Science",
        icon: "💻",
        courses: "Programming, Data Structures, Algorithms",
    },
    {
        name: "English",
        icon: "📚",
        courses: "Literature, Grammar, Writing, Communication",
    },
    {
        name: "Economics",
        icon: "📊",
        courses: "Micro, Macro, International Economics",
    },
    {
        name: "Accounting",
        icon: "💰",
        courses: "Financial, Management, Cost Accounting",
    },
]

const stats = [
    { number: "10,000+", label: "Students Helped", icon: Users },
    { number: "500+", label: "Expert Tutors", icon: Award },
    { number: "50+", label: "Subjects Covered", icon: BookOpen },
    { number: "99.9%", label: "Uptime", icon: Zap },
]

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-orange-100">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        {/* Content Section */}
                        <div className="text-center lg:text-left order-2 lg:order-1">
                            <Badge className="mb-6 bg-black text-white px-6 py-3 border-3 border-black shadow-[4px_4px_0px_0px_black] font-black uppercase tracking-wide">
                                Premium Learning Platform
                            </Badge>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black mb-6 leading-tight uppercase">
                                Powerful Features for
                                <span className="text-black">
                                    {" "}
                                    Modern Learning
                                </span>
                            </h1>
                            <p className="text-xl text-black max-w-3xl mx-auto lg:mx-0 mb-8 leading-relaxed font-bold">
                                Discover how NerdsOnCall revolutionizes
                                education with cutting-edge technology, expert
                                tutors, and innovative learning tools designed
                                for your success.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link href="/auth/register?role=student">
                                    <Button
                                        size="lg"
                                        className="bg-cyan-300 hover:bg-cyan-400 text-black px-8 py-4 text-lg font-black border-3 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all uppercase tracking-wide"
                                    >
                                        <PlayCircle className="mr-2 h-5 w-5" />
                                        Start Learning Now
                                    </Button>
                                </Link>
                                <Link href="/pricing">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="bg-pink-300 hover:bg-pink-400 border-3 border-black text-black px-8 py-4 text-lg font-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all uppercase tracking-wide"
                                    >
                                        View Pricing
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Image Section */}
                        <div className="flex justify-center items-center order-1 lg:order-2">
                            <div className="relative">
                                <img
                                    src="/features-page.png"
                                    alt="Features Illustration"
                                    className="w-full max-w-lg h-auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-yellow-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black text-black mb-6 uppercase tracking-wide">
                            Core Features That Make Us Different
                        </h2>
                        <div className="text-xl text-black max-w-3xl mx-auto font-bold">
                            Experience the future of education with our
                            comprehensive suite of learning tools
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {mainFeatures.map((feature, index) => (
                            <Card
                                key={index}
                                className="bg-white border-3 border-black shadow-[6px_6px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_black] transition-all duration-300 group"
                            >
                                <CardContent className="p-8">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-16 h-16 bg-black border-2 border-black flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <feature.icon className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-black text-black mb-3 uppercase tracking-wide">
                                                {feature.title}
                                            </h3>
                                            <p className="text-black mb-4 leading-relaxed font-bold">
                                                {feature.description}
                                            </p>
                                            <ul className="space-y-2">
                                                {feature.details.map(
                                                    (detail, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="flex items-center text-sm text-black font-bold"
                                                        >
                                                            <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                                                            {detail}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Additional Features */}
            <section className="py-20 bg-pink-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black text-black mb-6 uppercase tracking-wide">
                            Advanced Learning Tools
                        </h2>
                        <div className="text-xl text-black max-w-3xl mx-auto font-bold">
                            Enhance your learning experience with our additional
                            features and tools
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {additionalFeatures.map((feature, index) => (
                            <Card
                                key={index}
                                className="bg-white border-3 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all duration-300 group"
                            >
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-black border-2 border-black flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <feature.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-black text-black mb-3 uppercase tracking-wide">
                                        {feature.title}
                                    </h3>
                                    <p className="text-black text-sm leading-relaxed font-bold">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Subjects Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-green-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black text-black mb-6 uppercase tracking-wide">
                            Subjects We Cover
                        </h2>
                        <div className="text-xl text-black max-w-3xl mx-auto font-bold">
                            From elementary concepts to advanced university
                            courses, we&apos;ve got you covered
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {subjects.map((subject, index) => (
                            <Card
                                key={index}
                                className="bg-white border-3 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all duration-300 group"
                            >
                                <CardContent className="p-6 text-center">
                                    <div className="text-4xl mb-4">
                                        {subject.icon}
                                    </div>
                                    <h3 className="text-lg font-black text-black mb-2 uppercase tracking-wide">
                                        {subject.name}
                                    </h3>
                                    <p className="text-black text-sm font-bold">
                                        {subject.courses}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
