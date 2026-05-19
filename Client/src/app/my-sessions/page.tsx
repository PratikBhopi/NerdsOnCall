"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Calendar,
    Clock,
    Star,
    User,
    CheckCircle,
    Plus,
    Video,
    AlertCircle,
    Play,
    XCircle,
} from "lucide-react"

interface Session {
    id: number
    sessionId: string
    status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "TIMEOUT"
    paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
    startTime: string
    actualStartTime?: string
    endTime?: string
    durationMinutes?: number
    cost?: number
    tutorEarnings?: number
    amount?: number
    commission?: number
    roomId?: string
    sessionNotes?: string
    canvasData?: string
    recordingEnabled?: boolean
    recordingUrl?: string
    createdAt?: string
    updatedAt?: string
    tutor?: {
        id: number
        firstName: string
        lastName: string
        email?: string
        profilePicture?: string
        rating?: number
    }
    student?: {
        id: number
        firstName: string
        lastName: string
        email?: string
        profilePicture?: string
    }
    doubt?: {
        id: number
        title: string
        subject: string
        description: string
    }
}

export default function MySessionsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch completed sessions from API
    const fetchSessions = async () => {
        try {
            setLoading(true)
            const response = await api.get("/api/sessions/my-sessions")
            // Filter to only show completed sessions
            const completedSessions = response.data.filter(
                (session: Session) => session.status === "COMPLETED"
            )
            setSessions(completedSessions)
        } catch (error) {
            console.error("Error fetching sessions:", error)
            setSessions([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchSessions()
        }
    }, [user])

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "ACTIVE":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "COMPLETED":
                return "bg-green-100 text-green-800 border-green-200"
            case "CANCELLED":
                return "bg-red-100 text-red-800 border-red-200"
            case "TIMEOUT":
                return "bg-orange-100 text-orange-800 border-orange-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    // Get status display text
    const getStatusText = (status: string) => {
        switch (status) {
            case "PENDING":
                return "Scheduled"
            case "ACTIVE":
                return "In Progress"
            case "COMPLETED":
                return "Completed"
            case "CANCELLED":
                return "Cancelled"
            case "TIMEOUT":
                return "Timed Out"
            default:
                return status
        }
    }

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Clock className="h-4 w-4" />
            case "ACTIVE":
                return <Play className="h-4 w-4" />
            case "COMPLETED":
                return <CheckCircle className="h-4 w-4" />
            case "CANCELLED":
                return <XCircle className="h-4 w-4" />
            case "TIMEOUT":
                return <AlertCircle className="h-4 w-4" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    // Join session
    const joinSession = (session: Session) => {
        if (session.recordingUrl) {
            window.open(session.recordingUrl, "_blank")
        } else {
            // Use existing sessionId or generate one
            const sessionIdToUse =
                session.sessionId || `session_${session.id}_${Date.now()}`

            if (isStudent && session.tutor) {
                const tutorId = session.tutor.id
                const tutorName = `${session.tutor.firstName} ${session.tutor.lastName}`
                router.push(
                    `/video-call/${sessionIdToUse}?role=student&tutorId=${tutorId}&tutorName=${encodeURIComponent(
                        tutorName
                    )}`
                )
            } else if (!isStudent && session.student) {
                const studentId = session.student.id
                const studentName = `${session.student.firstName} ${session.student.lastName}`
                router.push(
                    `/video-call/${sessionIdToUse}?role=tutor&studentId=${studentId}&studentName=${encodeURIComponent(
                        studentName
                    )}`
                )
            } else {
                // Fallback - just use the sessionId
                router.push(`/video-call/${sessionIdToUse}`)
            }
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">
                            Access Denied
                        </h2>
                        <p className="text-slate-600 mb-4">
                            Please log in to view your sessions.
                        </p>
                        <Button onClick={() => router.push("/auth/login")}>
                            Sign In
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const isStudent = user.role === "STUDENT"

    return (
        <div className="min-h-screen bg-cyan-100">
            <Navbar />

            <div className="pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] p-6 rounded-none">
                                <h1 className="text-4xl font-black text-black mb-2 uppercase tracking-wide">
                                    📚 My Sessions
                                </h1>
                                <p className="text-lg text-black font-bold">
                                    {isStudent
                                        ? "🎓 Your Learning Journey"
                                        : "👨‍🏫 Your Teaching History"}
                                </p>
                            </div>
                            {isStudent && (
                                <Link href="/browse-tutors">
                                    <div className="bg-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_black] transition-all cursor-pointer">
                                        <div className="px-6 py-3 flex items-center space-x-2">
                                            <Plus className="h-5 w-5 text-black" />
                                            <span className="text-black font-black uppercase tracking-wide">
                                                New Session
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Sessions */}
                    <div className="space-y-6">
                        {loading ? (
                            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] p-12 text-center">
                                <div className="w-16 h-16 bg-black border-4 border-black mx-auto mb-6 animate-pulse"></div>
                                <p className="text-2xl font-black text-black uppercase tracking-wide">
                                    ⏳ Loading Sessions...
                                </p>
                                <p className="text-lg text-black font-bold mt-2">
                                    Getting your awesome sessions ready!
                                </p>
                            </div>
                        ) : sessions.length > 0 ? (
                            sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_black] transition-all"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                {/* Session Header */}
                                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                                    <div className="bg-purple-400 border-3 border-black px-3 py-1 shadow-[3px_3px_0px_0px_black]">
                                                        <span className="text-black font-black uppercase tracking-wide text-sm">
                                                            📚{" "}
                                                            {session.doubt
                                                                ?.subject ||
                                                                "General"}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={`border-3 border-black px-3 py-1 shadow-[3px_3px_0px_0px_black] flex items-center space-x-1 ${
                                                            session.status ===
                                                            "COMPLETED"
                                                                ? "bg-green-400"
                                                                : session.status ===
                                                                  "ACTIVE"
                                                                ? "bg-yellow-400"
                                                                : session.status ===
                                                                  "PENDING"
                                                                ? "bg-blue-400"
                                                                : session.status ===
                                                                  "CANCELLED"
                                                                ? "bg-red-400"
                                                                : "bg-orange-400"
                                                        }`}
                                                    >
                                                        {getStatusIcon(
                                                            session.status
                                                        )}
                                                        <span className="text-black font-black uppercase tracking-wide text-sm">
                                                            {getStatusText(
                                                                session.status
                                                            )}
                                                        </span>
                                                    </div>
                                                    {typeof session.durationMinutes === "number" && session.durationMinutes > 0 && (
                                                        <div className="bg-cyan-400 border-3 border-black px-3 py-1 shadow-[3px_3px_0px_0px_black]">
                                                            <span className="text-black font-black uppercase tracking-wide text-sm">
                                                                ⏱️{" "}
                                                                {
                                                                    session.durationMinutes
                                                                }{" "}
                                                                min
                                                            </span>
                                                        </div>
                                                    )}
                                                    {typeof session.cost === "number" && session.cost > 0 && (
                                                        <div className="bg-green-400 border-3 border-black px-3 py-1 shadow-[3px_3px_0px_0px_black]">
                                                            <span className="text-black font-black uppercase tracking-wide text-sm">
                                                                💰 ₹
                                                                {Math.round(
                                                                    session.cost
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Session Content */}
                                                <h3 className="text-2xl font-black text-black mb-3 uppercase tracking-wide">
                                                    🎯{" "}
                                                    {session.doubt?.title ||
                                                        `Tutoring Session`}
                                                </h3>

                                                {session.doubt?.description && (
                                                    <div className="bg-gray-100 border-3 border-black p-4 mb-4 shadow-[4px_4px_0px_0px_black]">
                                                        <p className="text-black font-bold">
                                                            {session.doubt
                                                                .description
                                                                .length > 150
                                                                ? `${session.doubt.description.substring(
                                                                      0,
                                                                      150
                                                                  )}...`
                                                                : session.doubt
                                                                      .description}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Participant Info */}
                                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-12 h-12 bg-pink-400 border-3 border-black shadow-[3px_3px_0px_0px_black] flex items-center justify-center text-black text-lg font-black">
                                                            {isStudent
                                                                ? session.tutor
                                                                      ?.firstName?.[0] ||
                                                                  "T"
                                                                : session
                                                                      .student
                                                                      ?.firstName?.[0] ||
                                                                  "S"}
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-black text-black">
                                                                {isStudent
                                                                    ? session.tutor
                                                                        ? `${session.tutor.firstName} ${session.tutor.lastName}`
                                                                        : "Unknown Tutor"
                                                                    : session.student
                                                                    ? `${session.student.firstName} ${session.student.lastName}`
                                                                    : "Unknown Student"}
                                                            </p>
                                                            <p className="text-sm font-bold text-black uppercase tracking-wide">
                                                                {isStudent
                                                                    ? "👨‍🏫 Your Tutor"
                                                                    : "🎓 Your Student"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {typeof session.tutor?.rating === "number" && session.tutor.rating > 0 && (
                                                        <div className="bg-yellow-400 border-3 border-black px-3 py-2 shadow-[3px_3px_0px_0px_black] flex items-center space-x-2">
                                                            <Star className="h-5 w-5 text-black fill-current" />
                                                            <span className="text-black font-black">
                                                                {
                                                                    session
                                                                        .tutor
                                                                        .rating
                                                                }
                                                                /5
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Session Details */}
                                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                                    <div className="bg-blue-400 border-3 border-black px-3 py-2 shadow-[3px_3px_0px_0px_black] flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4 text-black" />
                                                        <span className="text-black font-bold text-sm">
                                                            {session.actualStartTime
                                                                ? new Date(
                                                                      session.actualStartTime
                                                                  ).toLocaleDateString() +
                                                                  " at " +
                                                                  new Date(
                                                                      session.actualStartTime
                                                                  ).toLocaleTimeString(
                                                                      [],
                                                                      {
                                                                          hour: "2-digit",
                                                                          minute: "2-digit",
                                                                      }
                                                                  )
                                                                : new Date(
                                                                      session.startTime
                                                                  ).toLocaleDateString() +
                                                                  " (Created)"}
                                                        </span>
                                                    </div>
                                                    {session.endTime && (
                                                        <div className="bg-green-400 border-3 border-black px-3 py-2 shadow-[3px_3px_0px_0px_black] flex items-center space-x-2">
                                                            <CheckCircle className="h-4 w-4 text-black" />
                                                            <span className="text-black font-bold text-sm">
                                                                Completed{" "}
                                                                {new Date(
                                                                    session.endTime
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Session Notes */}
                                                {session.sessionNotes && (
                                                    <div className="bg-yellow-200 border-3 border-black p-4 mb-4 shadow-[4px_4px_0px_0px_black]">
                                                        <p className="text-black font-bold">
                                                            💭 &quot;
                                                            {
                                                                session.sessionNotes
                                                            }
                                                            &quot;
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col space-y-3 ml-4">
                                                {["PENDING", "ACTIVE"].includes(
                                                    session.status
                                                ) && (
                                                    <div
                                                        onClick={() =>
                                                            joinSession(session)
                                                        }
                                                        className="bg-green-400 border-4 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all cursor-pointer"
                                                    >
                                                        <div className="px-4 py-3 flex items-center space-x-2">
                                                            <Video className="h-5 w-5 text-black" />
                                                            <span className="text-black font-black uppercase tracking-wide text-sm">
                                                                {session.status ===
                                                                "ACTIVE"
                                                                    ? "🔄 Rejoin"
                                                                    : "▶️ Join"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] p-12 text-center">
                                <div className="w-24 h-24 bg-gray-300 border-4 border-black mx-auto mb-6 flex items-center justify-center">
                                    <span className="text-4xl">📚</span>
                                </div>
                                <h3 className="text-3xl font-black text-black mb-4 uppercase tracking-wide">
                                    No Sessions Yet!
                                </h3>
                                <p className="text-lg text-black font-bold mb-6">
                                    {isStudent
                                        ? "🎓 Ready to start your learning journey?"
                                        : "👨‍🏫 Waiting for students to book sessions!"}
                                </p>
                                {isStudent && (
                                    <Link href="/browse-tutors">
                                        <div className="bg-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_black] transition-all cursor-pointer inline-block">
                                            <div className="px-6 py-3 flex items-center space-x-2">
                                                <Plus className="h-5 w-5 text-black" />
                                                <span className="text-black font-black uppercase tracking-wide">
                                                    Book First Session
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
