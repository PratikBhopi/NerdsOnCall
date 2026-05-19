"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    Loader2,
    ArrowLeft,
    Calendar,
    User,
    BookOpen,
    ThumbsUp,
    MessageSquare,
    Upload,
} from "lucide-react"
import { BlockLoader } from "@/components/ui/Loader"
import { formatDistanceToNow } from "date-fns"
import { api } from "@/lib/api"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"

type QuestionStatus = "PENDING" | "RESOLVED"

interface Question {
    id: number
    studentId: number
    studentName: string
    tutorId?: number | null
    tutorName?: string | null
    questionTitle: string
    questionDescription: string
    subject: string
    solutionDescription?: string | null
    videoUrl?: string | null
    imageUrls?: string[]
    likesCount: number
    createdAt: string
    resolvedAt?: string | null
    status: QuestionStatus
}

export default function QuestionDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const [question, setQuestion] = useState<Question | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isLiking, setIsLiking] = useState(false)
    const [currentLikes, setCurrentLikes] = useState(0)

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const response = await api.get(`/api/questions/${id}`)
                const questionData = response.data

                setQuestion({
                    id: questionData.id,
                    studentId: questionData.studentId,
                    studentName: questionData.studentName,
                    tutorId: questionData.tutorId,
                    tutorName: questionData.tutorName,
                    questionTitle: questionData.questionTitle,
                    questionDescription: questionData.questionDescription,
                    subject: questionData.subject,
                    solutionDescription: questionData.solutionDescription,
                    videoUrl: questionData.videoUrl,
                    imageUrls: questionData.imageUrls,
                    likesCount: questionData.likesCount,
                    createdAt: questionData.createdAt,
                    resolvedAt: questionData.resolvedAt,
                    status: questionData.status,
                })
                setCurrentLikes(questionData.likesCount)
            } catch (error: any) {
                console.error("Error fetching question:", error)
                if (error.response?.status === 401) {
                    setError("Your session has expired. Please log in again.")
                } else if (error.response?.status === 404) {
                    setError("Question not found")
                } else {
                    setError("Failed to load question details")
                }
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchQuestion()
        }
    }, [id])

    const handleLike = async () => {
        if (isLiking || !question) return

        if (!user) {
            toast.error("You must be logged in to like questions")
            return
        }

        try {
            setIsLiking(true)
            await api.post(`/api/questions/${question.id}/like`)
            setCurrentLikes((prev) => prev + 1)
            toast.success("Question liked!")
        } catch (error: any) {
            console.error("Failed to like question:", error)
            if (error.response?.status === 401) {
                toast.error("Your session has expired. Please log in again.")
            } else if (error.response?.status === 409) {
                toast.error("You have already liked this question")
            } else {
                toast.error("Failed to like question. Please try again.")
            }
        } finally {
            setIsLiking(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-yellow-100">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="flex items-center gap-4 text-black">
                        <BlockLoader size="lg" />
                        <span className="text-lg font-bold uppercase tracking-wide">
                            Loading question...
                        </span>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (error || !question) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Question Not Found
                        </h1>
                        <p className="text-gray-600 mb-4">
                            {error ||
                                "The question you are looking for does not exist."}
                        </p>
                        <Link
                            href="/questions"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Questions
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    const formattedDate = formatDistanceToNow(new Date(question.createdAt), {
        addSuffix: true,
    })

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Questions
                    </button>

                    {/* Question Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-start justify-between mb-4">
                                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                                    {question.questionTitle}
                                </h1>
                                <span
                                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                                        question.status === "PENDING"
                                            ? "bg-amber-100 text-amber-800"
                                            : "bg-emerald-100 text-emerald-800"
                                    }`}
                                >
                                    {question.status}
                                </span>
                            </div>

                            {/* Meta Information */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium">
                                        {question.studentName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formattedDate}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    <span className="font-medium">
                                        {question.subject}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Question Content */}
                        <div className="p-6">
                            <div className="prose max-w-none">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {question.questionDescription}
                                </p>
                            </div>

                            {/* Question Images */}
                            {question.imageUrls &&
                                question.imageUrls.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            Attached Images
                                        </h3>
                                        <div className="space-y-2">
                                            {question.imageUrls.map(
                                                (imageUrl, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                Image{" "}
                                                                {index + 1}:
                                                            </span>
                                                            <a
                                                                href={imageUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                                                            >
                                                                View Image
                                                            </a>
                                                        </div>
                                                        <div className="mt-1">
                                                            <a
                                                                href={imageUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-gray-600 hover:text-gray-800 break-all"
                                                            >
                                                                {imageUrl}
                                                            </a>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>

                        {/* Actions */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handleLike}
                                        disabled={isLiking}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                            isLiking
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-white hover:shadow-sm"
                                        }`}
                                    >
                                        <ThumbsUp className="h-4 w-4" />
                                        <span className="font-medium">
                                            {currentLikes}
                                        </span>
                                    </button>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>
                                            {question.solutionDescription
                                                ? "1 answer"
                                                : "No answers yet"}
                                        </span>
                                    </div>
                                </div>

                                {question.status === "PENDING" && (
                                    <Link
                                        href={`/questions/${question.id}/answer`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-300 hover:bg-cyan-400 text-black border-3 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all font-black uppercase tracking-wide"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload Solution
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Solution Section */}
                    {question.status === "RESOLVED" &&
                        question.solutionDescription && (
                            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Solution
                                    </h2>
                                    {question.tutorName && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            Answered by{" "}
                                            <span className="font-medium">
                                                {question.tutorName}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                <div className="p-6">
                                    <div className="prose max-w-none mb-6">
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {question.solutionDescription}
                                        </p>
                                    </div>

                                    {question.videoUrl && (
                                        <div className="rounded-lg overflow-hidden bg-black">
                                            <video
                                                className="w-full max-h-96 object-contain"
                                                controls
                                                src={question.videoUrl}
                                            >
                                                Your browser does not support
                                                the video tag.
                                            </video>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                </div>
            </main>
            <Footer />
        </div>
    )
}
