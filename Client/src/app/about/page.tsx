"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
    Users,
    Target,
    Heart,
    Award,
    Globe,
    Lightbulb,
    BookOpen,
    Star,
    ArrowRight,
    CheckCircle,
    TrendingUp,
    Shield,
    Zap,
    Brain,
    Rocket,
    Coffee,
    Code,
    Palette,
    MessageSquare,
    Video,
    Clock,
} from "lucide-react"

const values = [
    {
        icon: Heart,
        title: "Student-Centric",
        description:
            "Every decision we make is guided by what&apos;s best for our students&apos; learning journey and success.",
    },
    {
        icon: Award,
        title: "Excellence",
        description:
            "We maintain the highest standards in tutor selection, platform quality, and educational outcomes.",
    },
    {
        icon: Globe,
        title: "Accessibility",
        description:
            "Quality education should be accessible to everyone, anywhere, at any time.",
    },
    {
        icon: Lightbulb,
        title: "Innovation",
        description:
            "We continuously evolve our platform with cutting-edge technology to enhance learning experiences.",
    },
]

const stats = [
    { number: "10,000+", label: "Students Helped", icon: Users },
    { number: "500+", label: "Expert Tutors", icon: Award },
    { number: "25+", label: "Countries Served", icon: Globe },
    { number: "98%", label: "Satisfaction Rate", icon: Star },
]

const features = [
    {
        icon: Video,
        title: "Live Video Sessions",
        description: "HD quality video calls with professional tutors",
    },
    {
        icon: MessageSquare,
        title: "AI Assistant",
        description: "Instant help with our intelligent chatbot",
    },
    {
        icon: BookOpen,
        title: "All Subjects",
        description: "Comprehensive coverage from K-12 to university",
    },
    {
        icon: Clock,
        title: "24/7 Available",
        description: "Round-the-clock access to learning support",
    },
]

export default function AboutPage() {
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
                                About NerdsOnCall
                            </Badge>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black mb-6 leading-tight uppercase">
                                Revolutionizing Education
                                <span className="text-black">
                                    {" "}
                                    One Student at a Time
                                </span>
                            </h1>
                            <p className="text-xl text-black max-w-3xl mx-auto lg:mx-0 mb-8 leading-relaxed font-bold">
                                We&apos;re on a mission to make quality
                                education accessible to every student, anywhere
                                in the world. Through innovative technology and
                                expert tutors, we&apos;re transforming how
                                students learn and succeed.
                            </p>
                        </div>

                        {/* Image Section */}
                        <div className="flex justify-center items-center order-1 lg:order-2">
                            <div className="relative">
                                <img
                                    src="/about-page.png"
                                    alt="About Us Illustration"
                                    className="w-full max-w-lg h-auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 bg-yellow-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-black text-black mb-6 uppercase tracking-wide">
                                Our Mission
                            </h2>
                            <p className="text-lg text-black mb-6 leading-relaxed font-bold">
                                To democratize access to quality education by
                                connecting students with expert tutors through
                                innovative technology, making learning
                                personalized, engaging, and effective.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-black text-black uppercase tracking-wide">
                                            Personalized Learning
                                        </h3>
                                        <p className="text-black font-bold">
                                            Tailored tutoring sessions that
                                            adapt to each student&apos;s unique
                                            learning style
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-black text-black uppercase tracking-wide">
                                            Global Accessibility
                                        </h3>
                                        <p className="text-black font-bold">
                                            Breaking down geographical barriers
                                            to connect students with the best
                                            tutors worldwide
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-black text-black uppercase tracking-wide">
                                            Technology-Enhanced
                                        </h3>
                                        <p className="text-black font-bold">
                                            Leveraging cutting-edge technology
                                            to create immersive learning
                                            experiences
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-black border-3 border-black shadow-[6px_6px_0px_0px_black] p-8 text-white">
                                <Target className="h-12 w-12 mb-6 text-cyan-300" />
                                <h3 className="text-2xl font-black mb-4 uppercase tracking-wide">
                                    Our Vision
                                </h3>
                                <p className="text-white leading-relaxed font-bold">
                                    To become the world&apos;s leading platform
                                    for personalized education, where every
                                    student has access to expert guidance and
                                    can achieve their full academic potential,
                                    regardless of their location or background.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-pink-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl sm:text-4xl font-black text-black mb-6 uppercase tracking-wide">
                            Our Core Values
                        </h2>
                        <div className="text-xl text-black max-w-3xl mx-auto font-bold">
                            The principles that guide everything we do and shape
                            our commitment to educational excellence
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <Card
                                key={index}
                                className="bg-white border-3 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all duration-300 group"
                            >
                                <CardContent className="p-6 text-center">
                                    <div className="w-16 h-16 bg-black border-2 border-black flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <value.icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h4 className="font-black text-black mb-3 uppercase tracking-wide">
                                        {value.title}
                                    </h4>
                                    <p className="text-black text-sm leading-relaxed font-bold">
                                        {value.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology */}
            <section className="py-20 bg-green-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black text-black mb-6 uppercase tracking-wide">
                            Built with Modern Technology
                        </h2>
                        <div className="text-xl text-black max-w-3xl mx-auto font-bold">
                            Our platform leverages cutting-edge technology to
                            deliver the best learning experience
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
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
                                    <p className="text-black text-sm font-bold">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <div className="bg-black border-3 border-black shadow-[6px_6px_0px_0px_black] p-8 text-white">
                            <Code className="h-12 w-12 mx-auto mb-4 text-cyan-300" />
                            <div className="text-2xl font-black mb-4 uppercase tracking-wide text-white">
                                Open Source & Secure
                            </div>
                            <div className="text-white max-w-2xl mx-auto mb-6 font-bold">
                                Built with Spring Boot, Next.js, and modern web
                                technologies. Our platform is secure, scalable,
                                and continuously updated with the latest
                                features.
                            </div>
                            <div className="flex flex-wrap justify-center gap-3">
                                <Badge className="bg-cyan-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_black] font-black uppercase tracking-wide">
                                    Spring Boot
                                </Badge>
                                <Badge className="bg-pink-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_black] font-black uppercase tracking-wide">
                                    Next.js
                                </Badge>
                                <Badge className="bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_black] font-black uppercase tracking-wide">
                                    WebRTC
                                </Badge>
                                <Badge className="bg-green-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_black] font-black uppercase tracking-wide">
                                    PostgreSQL
                                </Badge>
                                <Badge className="bg-orange-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_black] font-black uppercase tracking-wide">
                                    TypeScript
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    )
}
