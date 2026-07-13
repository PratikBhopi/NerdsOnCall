"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
    ThumbsUp,
    MessageSquare,
    User,
    Calendar,
    BookOpen,
    Play,
    Eye,
    EyeOff,
} from "lucide-react"
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

type QuestionCardProps = {
    question: Question
    isTutor?: boolean
    showSolutionButton?: boolean
}

export function QuestionCard({
    question,
    isTutor = false,
    showSolutionButton = false,
}: QuestionCardProps) {
    const { user } = useAuth()
    const [isSolutionOpen, setIsSolutionOpen] = useState(false)
    const [isLiking, setIsLiking] = useState(false)
    const [currentLikes, setCurrentLikes] = useState(question.likesCount)
    const {
        id,
        questionTitle,
        questionDescription,
        subject,
        status,
        createdAt,
        studentName,
        solutionDescription,
        videoUrl,
        imageUrls,
    } = question
    const formattedDate = formatDistanceToNow(new Date(createdAt), {
        addSuffix: true,
    })

    const handleLike = async () => {
        if (isLiking) return

        if (!user) {
            toast.error("You must be logged in to like questions")
            return
        }

        try {
            setIsLiking(true)
            await api.post(`/api/questions/${id}/like`)
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

    return (
        <article className="bg-white border-3 border-black shadow-[6px_6px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_black] transition-all duration-150 overflow-hidden">
            {/* Status strip */}
            <div
                className={`px-4 sm:px-5 py-2.5 border-b-3 border-black flex items-center justify-between gap-3 ${
                    status === "PENDING" ? "bg-yellow-200" : "bg-green-200"
                }`}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border-2 border-black text-xs font-black uppercase tracking-wide shadow-[2px_2px_0px_0px_black]">
                        <BookOpen className="h-3 w-3" />
                        {subject}
                    </span>
                </div>
                <span
                    className={`inline-flex shrink-0 px-2.5 py-0.5 text-xs font-black border-2 border-black uppercase tracking-wide shadow-[2px_2px_0px_0px_black] ${
                        status === "PENDING"
                            ? "bg-orange-300 text-black"
                            : "bg-cyan-300 text-black"
                    }`}
                >
                    {status}
                </span>
            </div>

            {/* Header */}
            <div className="p-4 sm:p-5 bg-yellow-50">
                <h3 className="text-lg sm:text-xl font-black text-black leading-snug uppercase tracking-wide mb-3 break-words">
                    <Link
                        href={`/questions/${id}`}
                        className="hover:underline transition-colors"
                    >
                        {questionTitle}
                    </Link>
                </h3>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-black font-bold">
                    <div className="flex items-center gap-1.5 bg-pink-200 px-2.5 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_black]">
                        <User className="h-3 w-3" />
                        <span className="uppercase tracking-wide">{studentName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-cyan-200 px-2.5 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_black]">
                        <Calendar className="h-3 w-3" />
                        <span className="uppercase tracking-wide">{formattedDate}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 bg-white border-t-3 border-black">
                <p className="text-black font-bold leading-relaxed line-clamp-3 text-sm sm:text-base break-words">
                    {questionDescription}
                </p>

                {/* Images */}
                {imageUrls && imageUrls.length > 0 && (
                    <div className="mt-3 space-y-1">
                        <p className="text-xs font-black uppercase tracking-wide text-black">
                            Attached Images:
                        </p>
                        {imageUrls.map((imageUrl, index) => (
                            <div key={index} className="text-xs">
                                <a
                                    href={imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-black font-bold underline break-all hover:no-underline"
                                >
                                    Image {index + 1}
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-5 py-3 bg-cyan-50 border-t-3 border-black">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-3 sm:gap-5">
                        <button
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_black] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_black] transition-all text-xs font-black uppercase tracking-wide ${
                                isLiking ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span>{currentLikes}</span>
                        </button>
                        <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-black">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>
                                {solutionDescription ? "1 answer" : "No answers yet"}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {isTutor && status === "PENDING" && (
                            <Link
                                href={`/questions/${id}/answer`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-300 hover:bg-green-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_black] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_black] transition-all text-xs font-black uppercase tracking-wide"
                            >
                                <Play className="h-3.5 w-3.5" />
                                Upload Solution
                            </Link>
                        )}

                        {status === "RESOLVED" && (
                            <button
                                onClick={() => setIsSolutionOpen(!isSolutionOpen)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_black] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_black] transition-all text-xs font-black uppercase tracking-wide"
                            >
                                {isSolutionOpen ? (
                                    <>
                                        <EyeOff className="h-3.5 w-3.5" />
                                        Hide Solution
                                    </>
                                ) : (
                                    <>
                                        <Eye className="h-3.5 w-3.5" />
                                        Show Solution
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Solution Accordion */}
            {status === "RESOLVED" && isSolutionOpen && (
                <div className="border-t-3 border-black">
                    <div className="p-4 sm:p-5 bg-yellow-50">
                        <h4 className="text-base sm:text-lg font-black text-black mb-3 uppercase tracking-wide flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Solution
                        </h4>
                        {solutionDescription && (
                            <div className="mb-4">
                                <p className="text-black font-bold leading-relaxed whitespace-pre-wrap text-sm sm:text-base break-words">
                                    {solutionDescription}
                                </p>
                            </div>
                        )}
                        {videoUrl && (
                            <div className="overflow-hidden bg-black border-2 border-black shadow-[3px_3px_0px_0px_black]">
                                <video
                                    className="w-full max-h-96 object-contain"
                                    controls
                                    src={videoUrl}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </article>
    )
}
