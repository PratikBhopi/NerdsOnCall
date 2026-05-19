"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import toast from "react-hot-toast"
import { QuestionCard } from "./QuestionCard"
import { api } from "@/lib/api"
import { getUserFriendlyErrorMessage } from "@/utils/errorMessages"
import { Search, Filter, BookOpen, Clock, CheckCircle } from "lucide-react"

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
    likesCount: number
    createdAt: string
    resolvedAt?: string | null
    status: QuestionStatus
}

interface QuestionListProps {
    isTutor?: boolean
    showSolutionButton?: boolean
    initialQuestions?: Question[]
}

export function QuestionList({
    isTutor = false,
    showSolutionButton = false,
    initialQuestions = [],
}: QuestionListProps) {
    const [questions, setQuestions] = useState<Question[]>(initialQuestions)
    const [loading, setLoading] = useState(initialQuestions.length === 0)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")

    const hasFetched = useRef(false) // ✅ guard to avoid multiple API calls

    useEffect(() => {
        const fetchQuestions = async () => {
            if (hasFetched.current || initialQuestions.length > 0) return
            hasFetched.current = true

            setLoading(true)
            try {
                const response = await api.get("api/questions")

                // Map the API response to match our Question interface
                const formattedQuestions = response.data.map((q: any) => ({
                    id: q.id,
                    studentId: q.studentId,
                    studentName: q.studentName || "Anonymous",
                    tutorId: q.tutorId,
                    tutorName: q.tutorName,
                    questionTitle: q.questionTitle || "No title",
                    questionDescription:
                        q.questionDescription || "No description",
                    subject: q.subject || "General",
                    solutionDescription: q.solutionDescription,
                    videoUrl: q.videoUrl,
                    likesCount: q.likesCount || 0,
                    createdAt: q.createdAt || new Date().toISOString(),
                    resolvedAt: q.resolvedAt,
                    status: q.status || "PENDING",
                }))

                setQuestions(formattedQuestions)
            } catch (err) {
                console.error("Error fetching questions:", err)
                const message = getUserFriendlyErrorMessage(
                    err as any,
                    "general"
                )
                setError(message)
                toast.error(message)
            } finally {
                setLoading(false)
            }
        }

        fetchQuestions()
    }, []) // ✅ Only run once on mount

    const filteredQuestions = useMemo(() => {
        return questions.filter((question) => {
            const matchesSearch =
                searchTerm === "" ||
                question.questionTitle
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                question.questionDescription
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())

            const matchesStatus =
                statusFilter === "ALL" || question.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [questions, searchTerm, statusFilter])

    return (
        <div className="space-y-8">
            {/* Search and Filter Controls */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search questions by title, description, or subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-4 py-3 border-3 border-black shadow-[4px_4px_0px_0px_black] focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[6px_6px_0px_0px_black] transition-all font-bold text-black placeholder:text-gray-600"
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="pl-10 pr-8 py-3 border-3 border-black shadow-[4px_4px_0px_0px_black] focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[6px_6px_0px_0px_black] transition-all appearance-none bg-white font-bold text-black"
                            >
                                <option value="ALL">All Questions</option>
                                <option value="PENDING">Pending</option>
                                <option value="RESOLVED">Resolved</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Filter Stats */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{filteredQuestions.length} questions found</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span>
                            {
                                filteredQuestions.filter(
                                    (q) => q.status === "PENDING"
                                ).length
                            }{" "}
                            pending
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>
                            {
                                filteredQuestions.filter(
                                    (q) => q.status === "RESOLVED"
                                ).length
                            }{" "}
                            resolved
                        </span>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            {loading ? (
                <div className="space-y-6">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                        >
                            <div className="animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <div className="text-red-600 font-medium mb-2">
                        Error Loading Questions
                    </div>
                    <p className="text-red-500">{error}</p>
                </div>
            ) : filteredQuestions.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No questions found
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm || statusFilter !== "ALL"
                            ? "Try adjusting your search or filter criteria."
                            : "Be the first to ask a question!"}
                    </p>
                    {statusFilter !== "ALL" && (
                        <button
                            onClick={() => setStatusFilter("ALL")}
                            className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredQuestions.map((question) => (
                        <QuestionCard
                            key={question.id}
                            question={question}
                            isTutor={isTutor}
                            showSolutionButton={
                                showSolutionButton &&
                                question.status === "PENDING"
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
