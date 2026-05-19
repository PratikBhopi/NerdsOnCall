"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
    Loader2,
    Upload,
    Video as VideoIcon,
    ArrowLeft,
    FileText,
    User,
    BookOpen,
    Lightbulb,
    Clapperboard,
} from "lucide-react"
import { BlockLoader } from "@/components/ui/Loader"
import { api } from "@/lib/api"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"
import { getUserFriendlyErrorMessage } from "@/utils/errorMessages"

type Question = {
    id: string
    title: string
    description: string
    subject: string
    studentName: string
    imageUrls?: string[]
}

export default function SubmitSolutionPage() {
    const router = useRouter()
    const { id } = useParams()
    const { user } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [question, setQuestion] = useState<Question | null>(null)
    const [solution, setSolution] = useState("")
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const response = await api.get(`/api/questions/${id}`)
                const questionData = response.data

                setQuestion({
                    id: questionData.id,
                    title: questionData.questionTitle,
                    description: questionData.questionDescription,
                    subject: questionData.subject,
                    studentName: questionData.studentName,
                    imageUrls: questionData.imageUrls,
                })
            } catch (error: any) {
                console.error("Error fetching question:", error)
                if (error.response?.status === 401) {
                    toast.error(
                        "Your session has expired. Please log in again."
                    )
                    router.push("/auth/login")
                } else {
                    toast.error("Failed to load question details")
                    router.push("/questions")
                }
            } finally {
                setIsLoading(false)
            }
        }

        if (id) {
            fetchQuestion()
        }
    }, [id, router])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("video/")) {
            toast.error("Please upload a valid video file")
            return
        }

        const maxSize = 100 * 1024 * 1024
        if (file.size > maxSize) {
            toast.error("Maximum file size is 100MB")
            return
        }

        setVideoFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!solution.trim()) {
            toast.error("Please provide a solution description")
            return
        }

        if (!videoFile) {
            toast.error("Please upload a video solution")
            return
        }

        if (!user) {
            toast.error("You must be logged in to submit a solution")
            router.push("/auth/login")
            return
        }

        setIsSubmitting(true)
        const loadingToast = toast.loading("Uploading your solution...")

        try {
            const formData = new FormData()
            formData.append("solutionDescription", solution.trim())
            formData.append("videoFile", videoFile)

            console.log("Submitting solution for question:", id)
            const response = await api.post(
                `/api/questions/${id}/solution`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            )

            console.log("Solution submitted successfully:", response.data)
            toast.success("Your solution has been submitted successfully!", {
                id: loadingToast,
            })

            // Reset form
            setSolution("")
            setVideoFile(null)
            setPreviewUrl(null)

            // Navigate back to questions
            router.push("/questions")
        } catch (error: any) {
            console.error("Error submitting solution:", error)

            const errorMessage = getUserFriendlyErrorMessage(error, "general")
            toast.error(errorMessage, { id: loadingToast })

            // Handle specific cases that need redirection
            if (error.response?.status === 401) {
                router.push("/auth/login")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
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

    if (!question) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Question Not Found
                        </h1>
                        <p className="text-gray-600 mb-4">
                            The question you are looking for does not exist.
                        </p>
                        <button
                            onClick={() => router.push("/questions")}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Questions
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white">
                    <div className="container mx-auto px-4 py-12">
                        <div className="max-w-3xl mx-auto text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                                <VideoIcon className="h-8 w-8" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                Submit a Solution
                            </h1>
                            <div className="text-xl text-green-100 max-w-2xl mx-auto">
                                Help other students by providing a detailed
                                solution with video explanation
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container mx-auto px-4 py-12 max-w-4xl">
                    <div className="space-y-8">
                        {/* Back Button */}
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Question
                        </button>

                        {/* Question Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    {question.title}
                                </h2>
                                <div className="prose max-w-none mb-4">
                                    <p className="text-gray-700 leading-relaxed">
                                        {question.description}
                                    </p>
                                </div>

                                {/* Question Images */}
                                {question.imageUrls &&
                                    question.imageUrls.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                Question Images
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
                                                                    href={
                                                                        imageUrl
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                                                                >
                                                                    View Image
                                                                </a>
                                                            </div>
                                                            <div className="mt-1">
                                                                <a
                                                                    href={
                                                                        imageUrl
                                                                    }
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

                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        <span>
                                            Asked by{" "}
                                            <span className="font-medium">
                                                {question.studentName}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4" />
                                        <span className="font-medium">
                                            {question.subject}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Solution Form */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Your Solution
                                </h3>
                                <p className="text-gray-600 mt-1">
                                    Provide a comprehensive solution to help the
                                    student
                                </p>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="p-6 space-y-8"
                            >
                                <div className="space-y-3">
                                    <label
                                        htmlFor="solution"
                                        className="flex items-center gap-2 text-lg font-semibold text-gray-900"
                                    >
                                        <FileText className="h-5 w-5 text-green-600" />
                                        Solution Explanation *
                                    </label>
                                    <textarea
                                        id="solution"
                                        placeholder="Explain the solution step by step. Be detailed and clear in your explanation..."
                                        className="w-full border border-gray-300 rounded-lg p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        value={solution}
                                        onChange={(e) =>
                                            setSolution(e.target.value)
                                        }
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-sm text-gray-600 flex items-start gap-2">
                                        <Lightbulb className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        Provide a clear, step-by-step
                                        explanation that helps the student
                                        understand the concept.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                        <VideoIcon className="h-5 w-5 text-green-600" />
                                        Video Solution *
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
                                        {previewUrl ? (
                                            <div className="space-y-4">
                                                <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                                                    <video
                                                        src={previewUrl}
                                                        controls
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setVideoFile(null)
                                                        setPreviewUrl(null)
                                                    }}
                                                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                                    disabled={isSubmitting}
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    Change Video
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer flex flex-col items-center justify-center gap-4">
                                                <div className="p-4 rounded-full bg-green-100 text-green-600">
                                                    <Upload className="h-8 w-8" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        Upload a video solution
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        MP4, WebM or MOV (max
                                                        100MB)
                                                    </p>
                                                </div>
                                                <div className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                                                    Choose Video File
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                    disabled={isSubmitting}
                                                />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 flex items-start gap-2">
                                        <Clapperboard className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        Record yourself explaining the solution
                                        step by step. This helps students
                                        understand better.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center font-medium transition-colors shadow-sm"
                                        disabled={
                                            isSubmitting ||
                                            !solution.trim() ||
                                            !videoFile
                                        }
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <BlockLoader
                                                    size="sm"
                                                    className="mr-2"
                                                />
                                                Submitting Solution...
                                            </>
                                        ) : (
                                            <>
                                                <VideoIcon className="mr-2 h-5 w-5" />
                                                Submit Solution
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
