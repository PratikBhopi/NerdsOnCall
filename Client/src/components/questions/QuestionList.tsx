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

    const hasFetched = useRef(false) // guard to avoid multiple API calls

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
    }, []) // Only run once on mount

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
        <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="bg-white border-3 border-black shadow-[6px_6px_0px_0px_black] p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search questions by title or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-black shadow-[3px_3px_0px_0px_black] focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[5px_5px_0px_0px_black] transition-all font-bold text-black placeholder:text-gray-500 bg-white outline-none"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black pointer-events-none" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-8 py-2.5 text-sm border-2 border-black shadow-[3px_3px_0px_0px_black] focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[5px_5px_0px_0px_black] transition-all appearance-none bg-white font-bold text-black w-full sm:w-auto outline-none"
                        >
                            <option value="ALL">All Questions</option>
                            <option value="PENDING">Pending</option>
                            <option value="RESOLVED">Resolved</option>
                        </select>
                    </div>
                </div>

                {/* Filter Stats */}
                <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-pink-200 border-2 border-black shadow-[2px_2px_0px_0px_black] text-xs sm:text-sm font-black uppercase tracking-wide text-black">
                        <BookOpen className="h-3.5 w-3.5" />
                        {filteredQuestions.length} found
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-200 border-2 border-black shadow-[2px_2px_0px_0px_black] text-xs sm:text-sm font-black uppercase tracking-wide text-black">
                        <Clock className="h-3.5 w-3.5" />
                        {
                            filteredQuestions.filter((q) => q.status === "PENDING").length
                        }{" "}
                        pending
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-200 border-2 border-black shadow-[2px_2px_0px_0px_black] text-xs sm:text-sm font-black uppercase tracking-wide text-black">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {
                            filteredQuestions.filter((q) => q.status === "RESOLVED").length
                        }{" "}
                        resolved
                    </div>
                </div>
            </div>

            {/* Questions List */}
            {loading ? (
                <div className="space-y-5">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white border-3 border-black shadow-[5px_5px_0px_0px_black] p-5"
                        >
                            <div className="animate-pulse">
                                <div className="h-5 bg-gray-200 border-2 border-black w-3/4 mb-4"></div>
                                <div className="h-3.5 bg-gray-200 border-2 border-black w-1/2 mb-3"></div>
                                <div className="h-3.5 bg-gray-200 border-2 border-black w-full mb-2"></div>
                                <div className="h-3.5 bg-gray-200 border-2 border-black w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-red-100 border-3 border-black shadow-[5px_5px_0px_0px_black] p-6 text-center">
                    <div className="text-black font-black uppercase tracking-wide mb-2">
                        Error Loading Questions
                    </div>
                    <p className="text-black font-bold">{error}</p>
                </div>
            ) : filteredQuestions.length === 0 ? (
                <div className="bg-white border-3 border-black shadow-[6px_6px_0px_0px_black] p-10 sm:p-12 text-center">
                    <div className="w-16 h-16 bg-cyan-200 border-2 border-black shadow-[3px_3px_0px_0px_black] flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-8 w-8 text-black" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-black mb-2 uppercase tracking-wide">
                        No questions found
                    </h3>
                    <p className="text-black font-bold mb-4">
                        {searchTerm || statusFilter !== "ALL"
                            ? "Try adjusting your search or filter criteria."
                            : "Be the first to ask a question!"}
                    </p>
                    {statusFilter !== "ALL" && (
                        <button
                            onClick={() => setStatusFilter("ALL")}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-200 hover:bg-yellow-300 text-black border-2 border-black shadow-[3px_3px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_black] transition-all font-black uppercase tracking-wide text-sm"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-5">
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
