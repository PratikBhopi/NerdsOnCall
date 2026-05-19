"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageCircle, Calendar, Clock, User } from "lucide-react"
import Link from "next/link"

interface Doubt {
    id: number
    title: string
    description: string
    subject: string
    priority: string
    status: string
    createdAt: string
    resolvedAt?: string
    solutionDescription?: string
    videoUrl?: string
    attachments?: string[]
    acceptedTutor?: {
        firstName: string
        lastName: string
    }
}

interface ExploreQuestion {
    id: number
    questionTitle: string
    questionDescription: string
    subject: string
    status: string
    createdAt: string
    resolvedAt?: string
    solutionDescription?: string
    videoUrl?: string
    imageUrls?: string[]
    tutorName?: string
    likesCount: number
}

export default function MyQuestionsPage() {
    const { user } = useAuth()
    const [doubts, setDoubts] = useState<Doubt[]>([])
    const [exploreQuestions, setExploreQuestions] = useState<ExploreQuestion[]>(
        []
    )
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user && user.role === "STUDENT") {
            fetchMyData()
        }
    }, [user])

    const fetchMyData = async () => {
        try {
            setLoading(true)

            // Fetch both doubts and explore questions in parallel
            const [doubtsResponse, questionsResponse] = await Promise.all([
                api.get("/api/doubts/student"),
                api.get("/api/questions/my-questions"),
            ])

            setDoubts(doubtsResponse.data)
            setExploreQuestions(questionsResponse.data)
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "OPEN":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "ASSIGNED":
                return "bg-green-100 text-green-800 border-green-200"
            case "IN_PROGRESS":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "CANCELLED":
                return "bg-red-100 text-red-800 border-red-200"
            case "RESOLVED":
                return "bg-purple-100 text-purple-800 border-purple-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "URGENT":
                return "bg-red-100 text-red-800 border-red-200"
            case "HIGH":
                return "bg-orange-100 text-orange-800 border-orange-200"
            case "MEDIUM":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "LOW":
                return "bg-green-100 text-green-800 border-green-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    if (!user || user.role !== "STUDENT") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Access denied. This page is for students only.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="pt-20 pb-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <Link href="/dashboard">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mr-4"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                                    My Questions
                                </h1>
                                <p className="text-slate-600">
                                    Track your questions from explore section
                                    and tutor requests
                                </p>
                            </div>
                            <Link href="/select-tutor">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Ask New Doubt
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Questions List */}
                    {loading ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
                                <p className="mt-4 text-slate-600">
                                    Loading your questions...
                                </p>
                            </CardContent>
                        </Card>
                    ) : doubts.length > 0 || exploreQuestions.length > 0 ? (
                        <div className="space-y-4">
                            {doubts.map((doubt) => (
                                <Card
                                    key={doubt.id}
                                    className="hover:shadow-md transition-shadow"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {doubt.subject.replace(
                                                            /_/g,
                                                            " "
                                                        )}
                                                    </Badge>
                                                    <Badge
                                                        className={`text-xs border ${getPriorityColor(
                                                            doubt.priority
                                                        )}`}
                                                    >
                                                        {doubt.priority}
                                                    </Badge>
                                                    <Badge
                                                        className={`text-xs border ${getStatusColor(
                                                            doubt.status
                                                        )}`}
                                                    >
                                                        {doubt.status}
                                                    </Badge>
                                                </div>

                                                <h3 className="font-semibold text-slate-800 mb-2">
                                                    {doubt.title}
                                                </h3>

                                                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                                    {doubt.description}
                                                </p>

                                                {/* Attachments */}
                                                {doubt.attachments &&
                                                    doubt.attachments.length >
                                                        0 && (
                                                        <div className="mb-4">
                                                            <div className="space-y-1">
                                                                <p className="text-xs font-medium text-gray-600">
                                                                    Attached
                                                                    Files:
                                                                </p>
                                                                {doubt.attachments
                                                                    .slice(0, 2)
                                                                    .map(
                                                                        (
                                                                            attachment,
                                                                            index
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="text-xs"
                                                                            >
                                                                                <a
                                                                                    href={
                                                                                        attachment
                                                                                    }
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-blue-600 hover:text-blue-800 underline break-all"
                                                                                >
                                                                                    File{" "}
                                                                                    {index +
                                                                                        1}

                                                                                    :{" "}
                                                                                    {attachment.length >
                                                                                    40
                                                                                        ? `${attachment.substring(
                                                                                              0,
                                                                                              40
                                                                                          )}...`
                                                                                        : attachment}
                                                                                </a>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                {doubt
                                                                    .attachments
                                                                    .length >
                                                                    2 && (
                                                                    <p className="text-xs text-gray-500">
                                                                        +
                                                                        {doubt
                                                                            .attachments
                                                                            .length -
                                                                            2}{" "}
                                                                        more
                                                                        files
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                {/* Solution */}
                                                {doubt.status === "RESOLVED" &&
                                                    doubt.solutionDescription && (
                                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                <span className="text-sm font-medium text-green-800">
                                                                    Solution
                                                                    Provided
                                                                </span>
                                                                {doubt.acceptedTutor && (
                                                                    <span className="text-xs text-green-600">
                                                                        by{" "}
                                                                        {
                                                                            doubt
                                                                                .acceptedTutor
                                                                                .firstName
                                                                        }{" "}
                                                                        {
                                                                            doubt
                                                                                .acceptedTutor
                                                                                .lastName
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-green-700 line-clamp-3">
                                                                {
                                                                    doubt.solutionDescription
                                                                }
                                                            </p>
                                                            {doubt.videoUrl && (
                                                                <div className="mt-4">
                                                                    <div className="relative">
                                                                        <div className="rounded-lg overflow-hidden bg-black shadow-lg">
                                                                            <video
                                                                                className="w-full max-h-64 object-contain hover:opacity-90 transition-opacity"
                                                                                controls
                                                                                preload="metadata"
                                                                                src={
                                                                                    doubt.videoUrl
                                                                                }
                                                                                onError={(
                                                                                    e
                                                                                ) => {
                                                                                    console.error(
                                                                                        "Video load error:",
                                                                                        e
                                                                                    )
                                                                                    e.currentTarget.style.display =
                                                                                        "none"
                                                                                    const errorDiv =
                                                                                        e
                                                                                            .currentTarget
                                                                                            .nextElementSibling as HTMLElement
                                                                                    if (
                                                                                        errorDiv
                                                                                    )
                                                                                        errorDiv.style.display =
                                                                                            "block"
                                                                                }}
                                                                            >
                                                                                Your
                                                                                browser
                                                                                does
                                                                                not
                                                                                support
                                                                                the
                                                                                video
                                                                                tag.
                                                                            </video>
                                                                            <div
                                                                                className="w-full h-32 items-center justify-center text-white text-sm bg-gray-800"
                                                                                style={{
                                                                                    display:
                                                                                        "none",
                                                                                }}
                                                                            >
                                                                                ⚠️
                                                                                Unable
                                                                                to
                                                                                load
                                                                                video.{" "}
                                                                                <a
                                                                                    href={
                                                                                        doubt.videoUrl
                                                                                    }
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="underline ml-1"
                                                                                >
                                                                                    Open
                                                                                    in
                                                                                    new
                                                                                    tab
                                                                                </a>
                                                                            </div>
                                                                        </div>
                                                                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                                            🎥
                                                                            Solution
                                                                            Video
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                <div className="flex items-center space-x-4 text-xs text-slate-500 mt-4">
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>
                                                            {new Date(
                                                                doubt.createdAt
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {doubt.acceptedTutor && (
                                                        <div className="flex items-center space-x-1">
                                                            <User className="h-3 w-3" />
                                                            <span>
                                                                {
                                                                    doubt
                                                                        .acceptedTutor
                                                                        .firstName
                                                                }{" "}
                                                                {
                                                                    doubt
                                                                        .acceptedTutor
                                                                        .lastName
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                    {doubt.resolvedAt && (
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>
                                                                Solved{" "}
                                                                {new Date(
                                                                    doubt.resolvedAt
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Explore Questions */}
                            {exploreQuestions.map((question) => (
                                <Card
                                    key={`explore-${question.id}`}
                                    className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                                    >
                                                        Explore Question
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {question.subject.replace(
                                                            /_/g,
                                                            " "
                                                        )}
                                                    </Badge>
                                                    <Badge
                                                        className={`text-xs border ${getStatusColor(
                                                            question.status
                                                        )}`}
                                                    >
                                                        {question.status}
                                                    </Badge>
                                                </div>

                                                <h3 className="font-semibold text-slate-800 mb-2">
                                                    {question.questionTitle}
                                                </h3>

                                                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                                    {
                                                        question.questionDescription
                                                    }
                                                </p>

                                                {/* Images */}
                                                {question.imageUrls &&
                                                    question.imageUrls.length >
                                                        0 && (
                                                        <div className="mb-4">
                                                            <div className="space-y-1">
                                                                <p className="text-xs font-medium text-gray-600">
                                                                    Attached
                                                                    Images:
                                                                </p>
                                                                {question.imageUrls
                                                                    .slice(0, 2)
                                                                    .map(
                                                                        (
                                                                            imageUrl,
                                                                            index
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="text-xs"
                                                                            >
                                                                                <a
                                                                                    href={
                                                                                        imageUrl
                                                                                    }
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-blue-600 hover:text-blue-800 underline break-all"
                                                                                >
                                                                                    Image{" "}
                                                                                    {index +
                                                                                        1}

                                                                                    :{" "}
                                                                                    {imageUrl.length >
                                                                                    40
                                                                                        ? `${imageUrl.substring(
                                                                                              0,
                                                                                              40
                                                                                          )}...`
                                                                                        : imageUrl}
                                                                                </a>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                {question
                                                                    .imageUrls
                                                                    .length >
                                                                    2 && (
                                                                    <p className="text-xs text-gray-500">
                                                                        +
                                                                        {question
                                                                            .imageUrls
                                                                            .length -
                                                                            2}{" "}
                                                                        more
                                                                        images
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                {/* Solution */}
                                                {question.status ===
                                                    "RESOLVED" &&
                                                    question.solutionDescription && (
                                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                <span className="text-sm font-medium text-green-800">
                                                                    Solution
                                                                    Provided
                                                                </span>
                                                                {question.tutorName && (
                                                                    <span className="text-xs text-green-600">
                                                                        by{" "}
                                                                        {
                                                                            question.tutorName
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-green-700 line-clamp-3">
                                                                {
                                                                    question.solutionDescription
                                                                }
                                                            </p>
                                                            {question.videoUrl && (
                                                                <div className="mt-4">
                                                                    <div className="relative">
                                                                        <div className="rounded-lg overflow-hidden bg-black shadow-lg">
                                                                            <video
                                                                                className="w-full max-h-64 object-contain hover:opacity-90 transition-opacity"
                                                                                controls
                                                                                preload="metadata"
                                                                                src={
                                                                                    question.videoUrl
                                                                                }
                                                                                onError={(
                                                                                    e
                                                                                ) => {
                                                                                    console.error(
                                                                                        "Video load error:",
                                                                                        e
                                                                                    )
                                                                                    e.currentTarget.style.display =
                                                                                        "none"
                                                                                    const errorDiv =
                                                                                        e
                                                                                            .currentTarget
                                                                                            .nextElementSibling as HTMLElement
                                                                                    if (
                                                                                        errorDiv
                                                                                    )
                                                                                        errorDiv.style.display =
                                                                                            "block"
                                                                                }}
                                                                            >
                                                                                Your
                                                                                browser
                                                                                does
                                                                                not
                                                                                support
                                                                                the
                                                                                video
                                                                                tag.
                                                                            </video>
                                                                            <div
                                                                                className="w-full h-32 items-center justify-center text-white text-sm bg-gray-800"
                                                                                style={{
                                                                                    display:
                                                                                        "none",
                                                                                }}
                                                                            >
                                                                                ⚠️
                                                                                Unable
                                                                                to
                                                                                load
                                                                                video.{" "}
                                                                                <a
                                                                                    href={
                                                                                        question.videoUrl
                                                                                    }
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="underline ml-1"
                                                                                >
                                                                                    Open
                                                                                    in
                                                                                    new
                                                                                    tab
                                                                                </a>
                                                                            </div>
                                                                        </div>
                                                                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                                            🎥
                                                                            Solution
                                                                            Video
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                <div className="flex items-center space-x-4 text-xs text-slate-500 mt-4">
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>
                                                            {new Date(
                                                                question.createdAt
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {question.resolvedAt && (
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>
                                                                Solved{" "}
                                                                {new Date(
                                                                    question.resolvedAt
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center space-x-1">
                                                        <span>
                                                            👍{" "}
                                                            {
                                                                question.likesCount
                                                            }{" "}
                                                            likes
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                    No Questions Yet
                                </h3>
                                <p className="text-slate-600 mb-6">
                                    You haven&apos;t asked any questions yet.
                                    Start learning by asking your first question
                                    in the explore section or request a tutor!
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Link href="/questions/ask">
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            <MessageCircle className="h-4 w-4 mr-2" />
                                            Ask in Explore
                                        </Button>
                                    </Link>
                                    <Link href="/select-tutor">
                                        <Button
                                            variant="outline"
                                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                        >
                                            <MessageCircle className="h-4 w-4 mr-2" />
                                            Ask Doubt
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    )
}
