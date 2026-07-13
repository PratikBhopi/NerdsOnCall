"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/Button"
<<<<<<< HEAD
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
=======
import { Card, CardContent } from "@/components/ui/card"
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
import {
    Calendar,
    Clock,
    Star,
<<<<<<< HEAD
    User,
=======
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
    CheckCircle,
    Plus,
    Video,
    AlertCircle,
    Play,
    XCircle,
<<<<<<< HEAD
=======
    BookOpen,
    Target,
    Timer,
    IndianRupee,
    GraduationCap,
    User as UserIcon,
    Quote,
    Library,
    RotateCw,
    History,
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
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

<<<<<<< HEAD
    // Fetch completed sessions from API
=======
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
    const fetchSessions = async () => {
        try {
            setLoading(true)
            const response = await api.get("/api/sessions/my-sessions")
<<<<<<< HEAD
            // Filter to only show completed sessions
=======
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
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

<<<<<<< HEAD
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
=======
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Clock className="h-3.5 w-3.5" />
            case "ACTIVE":
                return <Play className="h-3.5 w-3.5" />
            case "COMPLETED":
                return <CheckCircle className="h-3.5 w-3.5" />
            case "CANCELLED":
                return <XCircle className="h-3.5 w-3.5" />
            case "TIMEOUT":
                return <AlertCircle className="h-3.5 w-3.5" />
            default:
                return <Clock className="h-3.5 w-3.5" />
        }
    }

    const getStatusBg = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "bg-green-200"
            case "ACTIVE":
                return "bg-yellow-200"
            case "PENDING":
                return "bg-cyan-200"
            case "CANCELLED":
                return "bg-red-200"
            default:
                return "bg-orange-200"
        }
    }

>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
    const joinSession = (session: Session) => {
        if (session.recordingUrl) {
            window.open(session.recordingUrl, "_blank")
        } else {
<<<<<<< HEAD
            // Use existing sessionId or generate one
=======
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
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
<<<<<<< HEAD
                // Fallback - just use the sessionId
=======
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
                router.push(`/video-call/${sessionIdToUse}`)
            }
        }
    }

    if (!user) {
        return (
<<<<<<< HEAD
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">
                            Access Denied
                        </h2>
                        <p className="text-slate-600 mb-4">
=======
            <div className="min-h-screen flex items-center justify-center bg-yellow-100">
                <Card className="max-w-md mx-auto border-3 border-black shadow-[6px_6px_0px_0px_black]">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-black text-black mb-2 uppercase tracking-wide">
                            Access Denied
                        </h2>
                        <p className="text-black font-bold mb-4">
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
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
<<<<<<< HEAD
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
=======
        <div className="min-h-screen bg-yellow-100">
            <Navbar />

            <div className="pt-20 pb-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="bg-white border-3 border-black shadow-[6px_6px_0px_0px_black] p-5 sm:p-6 w-full sm:w-auto">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black mb-2 uppercase tracking-wide flex items-center gap-3">
                                    <Library className="h-7 w-7 sm:h-8 sm:w-8 text-black" strokeWidth={2.5} />
                                    My Sessions
                                </h1>
                                <p className="text-base sm:text-lg text-black font-bold flex items-center gap-2">
                                    {isStudent ? (
                                        <>
                                            <GraduationCap className="h-5 w-5" />
                                            Your Learning Journey
                                        </>
                                    ) : (
                                        <>
                                            <History className="h-5 w-5" />
                                            Your Teaching History
                                        </>
                                    )}
                                </p>
                            </div>
                            {isStudent && (
                                <Link href="/browse-tutors" className="w-full sm:w-auto">
                                    <div className="bg-cyan-300 hover:bg-cyan-400 border-3 border-black shadow-[5px_5px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_black] transition-all cursor-pointer">
                                        <div className="px-5 py-3 flex items-center justify-center space-x-2">
                                            <Plus className="h-5 w-5 text-black" strokeWidth={3} />
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
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
<<<<<<< HEAD
                    <div className="space-y-6">
                        {loading ? (
                            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] p-12 text-center">
                                <div className="w-16 h-16 bg-black border-4 border-black mx-auto mb-6 animate-pulse"></div>
                                <p className="text-2xl font-black text-black uppercase tracking-wide">
                                    ⏳ Loading Sessions...
                                </p>
                                <p className="text-lg text-black font-bold mt-2">
                                    Getting your awesome sessions ready!
=======
                    <div className="space-y-5">
                        {loading ? (
                            <div className="bg-white border-3 border-black shadow-[6px_6px_0px_0px_black] p-10 text-center">
                                <div className="w-14 h-14 bg-black border-3 border-black mx-auto mb-5 animate-pulse"></div>
                                <p className="text-xl sm:text-2xl font-black text-black uppercase tracking-wide">
                                    Loading Sessions...
                                </p>
                                <p className="text-base text-black font-bold mt-2">
                                    Getting your sessions ready
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
                                </p>
                            </div>
                        ) : sessions.length > 0 ? (
                            sessions.map((session) => (
                                <div
                                    key={session.id}
<<<<<<< HEAD
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
                                                    {session.durationMinutes && (
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
                                                    {session.cost && (
                                                        <div className="bg-green-400 border-3 border-black px-3 py-1 shadow-[3px_3px_0px_0px_black]">
                                                            <span className="text-black font-black uppercase tracking-wide text-sm">
                                                                💰 ₹
                                                                {Math.round(
                                                                    session.cost
                                                                )}
=======
                                    className="bg-white border-3 border-black shadow-[6px_6px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_black] transition-all overflow-hidden"
                                >
                                    <div className="p-5 sm:p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                {/* Session Meta Badges */}
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                                                    <div className="bg-pink-200 border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_black] inline-flex items-center gap-1.5">
                                                        <BookOpen className="h-3.5 w-3.5 text-black" />
                                                        <span className="text-black font-black uppercase tracking-wide text-xs sm:text-sm">
                                                            {session.doubt?.subject || "General"}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={`border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_black] inline-flex items-center gap-1.5 ${getStatusBg(
                                                            session.status
                                                        )}`}
                                                    >
                                                        {getStatusIcon(session.status)}
                                                        <span className="text-black font-black uppercase tracking-wide text-xs sm:text-sm">
                                                            {getStatusText(session.status)}
                                                        </span>
                                                    </div>
                                                    {typeof session.durationMinutes === "number" &&
                                                        session.durationMinutes > 0 && (
                                                            <div className="bg-cyan-200 border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_black] inline-flex items-center gap-1.5">
                                                                <Timer className="h-3.5 w-3.5 text-black" />
                                                                <span className="text-black font-black uppercase tracking-wide text-xs sm:text-sm">
                                                                    {session.durationMinutes} min
                                                                </span>
                                                            </div>
                                                        )}
                                                    {typeof session.cost === "number" && session.cost > 0 && (
                                                        <div className="bg-green-200 border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_black] inline-flex items-center gap-1.5">
                                                            <IndianRupee className="h-3.5 w-3.5 text-black" />
                                                            <span className="text-black font-black uppercase tracking-wide text-xs sm:text-sm">
                                                                {Math.round(session.cost)}
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

<<<<<<< HEAD
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
=======
                                                {/* Session Title */}
                                                <h3 className="text-xl sm:text-2xl font-black text-black mb-3 uppercase tracking-wide flex items-start gap-2 break-words">
                                                    <Target className="h-6 w-6 mt-1 flex-shrink-0 text-black" strokeWidth={2.5} />
                                                    <span className="break-words">
                                                        {session.doubt?.title || "Tutoring Session"}
                                                    </span>
                                                </h3>

                                                {session.doubt?.description && (
                                                    <div className="bg-yellow-50 border-2 border-black p-3 sm:p-4 mb-4 shadow-[3px_3px_0px_0px_black]">
                                                        <p className="text-black font-bold text-sm sm:text-base break-words">
                                                            {session.doubt.description.length > 150
                                                                ? `${session.doubt.description.substring(0, 150)}...`
                                                                : session.doubt.description}
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Participant Info */}
<<<<<<< HEAD
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
=======
                                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-pink-300 border-2 border-black shadow-[3px_3px_0px_0px_black] flex items-center justify-center text-black text-base sm:text-lg font-black flex-shrink-0">
                                                            {isStudent
                                                                ? session.tutor?.firstName?.[0] || "T"
                                                                : session.student?.firstName?.[0] || "S"}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-base sm:text-lg font-black text-black truncate">
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
                                                                {isStudent
                                                                    ? session.tutor
                                                                        ? `${session.tutor.firstName} ${session.tutor.lastName}`
                                                                        : "Unknown Tutor"
                                                                    : session.student
                                                                    ? `${session.student.firstName} ${session.student.lastName}`
                                                                    : "Unknown Student"}
                                                            </p>
<<<<<<< HEAD
                                                            <p className="text-sm font-bold text-black uppercase tracking-wide">
                                                                {isStudent
                                                                    ? "👨‍🏫 Your Tutor"
                                                                    : "🎓 Your Student"}
=======
                                                            <p className="text-xs sm:text-sm font-bold text-black uppercase tracking-wide flex items-center gap-1">
                                                                {isStudent ? (
                                                                    <>
                                                                        <UserIcon className="h-3 w-3" />
                                                                        Your Tutor
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <GraduationCap className="h-3 w-3" />
                                                                        Your Student
                                                                    </>
                                                                )}
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
                                                            </p>
                                                        </div>
                                                    </div>

<<<<<<< HEAD
                                                    {session.tutor?.rating && (
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
=======
                                                    {typeof session.tutor?.rating === "number" &&
                                                        session.tutor.rating > 0 && (
                                                            <div className="bg-yellow-200 border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_black] inline-flex items-center gap-1.5">
                                                                <Star className="h-4 w-4 text-black fill-current" />
                                                                <span className="text-black font-black text-sm">
                                                                    {session.tutor.rating}/5
                                                                </span>
                                                            </div>
                                                        )}
                                                </div>

                                                {/* Session Details */}
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                                    <div className="bg-cyan-100 border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_black] inline-flex items-center gap-1.5 max-w-full">
                                                        <Calendar className="h-3.5 w-3.5 text-black flex-shrink-0" />
                                                        <span className="text-black font-bold text-xs sm:text-sm truncate">
                                                            {session.actualStartTime
                                                                ? new Date(session.actualStartTime).toLocaleDateString() +
                                                                  " at " +
                                                                  new Date(session.actualStartTime).toLocaleTimeString([], {
                                                                      hour: "2-digit",
                                                                      minute: "2-digit",
                                                                  })
                                                                : new Date(session.startTime).toLocaleDateString() +
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
                                                                  " (Created)"}
                                                        </span>
                                                    </div>
                                                    {session.endTime && (
<<<<<<< HEAD
                                                        <div className="bg-green-400 border-3 border-black px-3 py-2 shadow-[3px_3px_0px_0px_black] flex items-center space-x-2">
                                                            <CheckCircle className="h-4 w-4 text-black" />
                                                            <span className="text-black font-bold text-sm">
                                                                Completed{" "}
                                                                {new Date(
                                                                    session.endTime
                                                                ).toLocaleDateString()}
=======
                                                        <div className="bg-green-100 border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_black] inline-flex items-center gap-1.5">
                                                            <CheckCircle className="h-3.5 w-3.5 text-black" />
                                                            <span className="text-black font-bold text-xs sm:text-sm">
                                                                Completed{" "}
                                                                {new Date(session.endTime).toLocaleDateString()}
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Session Notes */}
                                                {session.sessionNotes && (
<<<<<<< HEAD
                                                    <div className="bg-yellow-200 border-3 border-black p-4 mb-4 shadow-[4px_4px_0px_0px_black]">
                                                        <p className="text-black font-bold">
                                                            💭 &quot;
                                                            {
                                                                session.sessionNotes
                                                            }
                                                            &quot;
=======
                                                    <div className="bg-yellow-200 border-2 border-black p-3 sm:p-4 mt-3 shadow-[3px_3px_0px_0px_black] flex items-start gap-2">
                                                        <Quote className="h-4 w-4 text-black mt-1 flex-shrink-0" />
                                                        <p className="text-black font-bold text-sm sm:text-base break-words">
                                                            {session.sessionNotes}
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
<<<<<<< HEAD
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
=======
                                            <div className="flex flex-col gap-2 lg:ml-2 lg:flex-shrink-0">
                                                {["PENDING", "ACTIVE"].includes(session.status) && (
                                                    <button
                                                        onClick={() => joinSession(session)}
                                                        className="bg-green-300 hover:bg-green-400 border-3 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all"
                                                    >
                                                        <div className="px-4 py-2.5 flex items-center justify-center space-x-2">
                                                            {session.status === "ACTIVE" ? (
                                                                <RotateCw className="h-4 w-4 text-black" strokeWidth={2.5} />
                                                            ) : (
                                                                <Video className="h-4 w-4 text-black" strokeWidth={2.5} />
                                                            )}
                                                            <span className="text-black font-black uppercase tracking-wide text-sm">
                                                                {session.status === "ACTIVE" ? "Rejoin" : "Join"}
                                                            </span>
                                                        </div>
                                                    </button>
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
<<<<<<< HEAD
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
=======
                            <div className="bg-white border-3 border-black shadow-[6px_6px_0px_0px_black] p-10 sm:p-12 text-center">
                                <div className="w-20 h-20 bg-cyan-200 border-3 border-black mx-auto mb-5 flex items-center justify-center shadow-[4px_4px_0px_0px_black]">
                                    <Library className="h-10 w-10 text-black" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black text-black mb-3 uppercase tracking-wide">
                                    No Sessions Yet
                                </h3>
                                <p className="text-base sm:text-lg text-black font-bold mb-6 flex items-center justify-center gap-2 flex-wrap">
                                    {isStudent ? (
                                        <>
                                            <GraduationCap className="h-5 w-5" />
                                            Ready to start your learning journey?
                                        </>
                                    ) : (
                                        <>
                                            <UserIcon className="h-5 w-5" />
                                            Waiting for students to book sessions
                                        </>
                                    )}
                                </p>
                                {isStudent && (
                                    <Link href="/browse-tutors">
                                        <div className="bg-cyan-300 hover:bg-cyan-400 border-3 border-black shadow-[5px_5px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_black] transition-all cursor-pointer inline-block">
                                            <div className="px-5 py-3 flex items-center space-x-2">
                                                <Plus className="h-5 w-5 text-black" strokeWidth={3} />
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
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
