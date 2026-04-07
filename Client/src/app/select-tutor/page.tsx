"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { toast } from "react-hot-toast"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/Input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { BlockLoader } from "@/components/ui/Loader"
import {
    Users,
    Search,
    Star,
    MessageCircle,
    ArrowLeft,
    AlertCircle,
    Clock,
    BookOpen,
    Filter,
} from "lucide-react"
import Link from "next/link"

interface Tutor {
    id: number
    firstName: string
    lastName: string
    email: string
    subjects: string[]
    rating: number
    isOnline: boolean
    profilePicture?: string
    bio?: string
    experience?: string
}

export default function SelectTutorPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [tutors, setTutors] = useState<Tutor[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSubject, setSelectedSubject] = useState("all")
    const [sessionStatus, setSessionStatus] = useState<any>(null)
    const [loadingSession, setLoadingSession] = useState(true)

    useEffect(() => {
        if (user && user.role === "STUDENT") {
            fetchTutors()
            fetchSessionStatus()
        }
    }, [user])

    const fetchTutors = async () => {
        try {
            setLoading(true)
            // Fetch online tutors using the new TutorStatus service
            const response = await api.get("/users/tutors/online")
            console.log("Online tutors fetched:", response.data.length)
            setTutors(response.data)
        } catch (error) {
            console.error("Error fetching online tutors:", error)
            // Fallback to all tutors and filter client-side
            try {
                const fallbackResponse = await api.get("/users/tutors")
                console.log("Fallback: All tutors fetched:", fallbackResponse.data.length)
                
                // Filter for only online tutors on the frontend
                const onlineTutors = fallbackResponse.data.filter(
                    (tutor: Tutor) => tutor.isOnline === true
                )
                console.log("Fallback: Online tutors after filtering:", onlineTutors.length)
                
                setTutors(onlineTutors)
            } catch (fallbackError) {
                console.error("Fallback fetch also failed:", fallbackError)
                setTutors([])
            }
        } finally {
            setLoading(false)
        }
    }

    const fetchSessionStatus = async () => {
        try {
            setLoadingSession(true)
            const response = await api.get("/subscriptions/session-status")
            setSessionStatus(response.data)
        } catch (error: any) {
            console.error("Error fetching session status:", error)
            // Set a default state for no subscription
            setSessionStatus({
                hasActiveSubscription: false,
                message: "Unable to load subscription status",
                canAskDoubt: false,
            })

            // Show error toast only if it's not a 401 or 400 (which might mean no subscription)
            if (
                error.response?.status !== 401 &&
                error.response?.status !== 400
            ) {
                toast.error("Failed to load subscription status")
            }
        } finally {
            setLoadingSession(false)
        }
    }

    const filteredTutors = tutors.filter((tutor) => {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch =
            searchQuery === "" ||
            `${tutor.firstName} ${tutor.lastName}`
                .toLowerCase()
                .includes(searchLower) ||
            tutor.subjects.some((subject) =>
                subject.toLowerCase().includes(searchLower)
            )

        const matchesSubject =
            selectedSubject === "all" ||
            tutor.subjects.includes(selectedSubject)

        // Additional safety check - only show online tutors
        const isOnline = tutor.isOnline === true

        return matchesSearch && matchesSubject && isOnline
    })

    const handleAskDoubt = (tutorId: number) => {
        // If session status is not loaded yet, allow the attempt (backend will validate)
        if (loadingSession) {
            toast.error("Please wait while we load your subscription status...")
            return
        }

        // Check session limits before allowing doubt submission
        if (sessionStatus && !sessionStatus.hasActiveSubscription) {
            toast.error(
                "You need an active subscription to ask doubts. Please subscribe to a plan first."
            )
            router.push("/pricing")
            return
        }

        if (sessionStatus && !sessionStatus.canAskDoubt) {
            toast.error(
                `Daily session limit reached! You have used ${sessionStatus.sessionsUsed} out of ${sessionStatus.sessionsLimit} allowed doubts for today. Your limit will reset at 12:00 AM.`
            )
            return
        }

        // If no session status (error case), let the backend handle validation
        router.push(`/ask-question?tutorId=${tutorId}`)
    }

    if (!user || user.role !== "STUDENT") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">
                            Access Denied
                        </h2>
                        <p className="text-slate-600 mb-4">
                            This page is only available to students.
                        </p>
                        <Button onClick={() => router.push("/dashboard")}>
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
            <Navbar />
            <div className="pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-slate-800 mb-4">
                                Select a Tutor
                            </h1>
                            <div className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Choose a tutor to ask your doubt. Each tutor
                                specializes in different subjects and can
                                provide personalized solutions.
                            </div>
                        </div>
                    </div>

                    {/* Session Status */}
                    {!loadingSession && sessionStatus && (
                        <Card className="mb-6">
                            <CardContent className="p-4">
                                {sessionStatus.hasActiveSubscription ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className={`w-3 h-3 rounded-full ${
                                                        sessionStatus.canAskDoubt
                                                            ? "bg-green-500"
                                                            : "bg-red-500"
                                                    }`}
                                                ></div>
                                                <span className="font-medium text-slate-800">
                                                    {sessionStatus.planName}{" "}
                                                    Plan
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                {sessionStatus.sessionsUsed} /{" "}
                                                {sessionStatus.sessionsLimit}{" "}
                                                sessions used today
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="text-sm font-medium text-slate-700">
                                                {
                                                    sessionStatus.sessionsRemaining
                                                }{" "}
                                                remaining
                                            </div>
                                            {!sessionStatus.canAskDoubt && (
                                                <Badge
                                                    variant="destructive"
                                                    className="text-xs"
                                                >
                                                    Limit Reached
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <AlertCircle className="h-5 w-5 text-orange-500" />
                                            <span className="font-medium text-slate-800">
                                                No Active Subscription
                                            </span>
                                        </div>
                                        <Link href="/pricing">
                                            <Button
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                Subscribe Now
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Search and Filter */}
                    <Card className="mb-8">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <Input
                                        placeholder="Search tutors by name or subject..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="h-12 bg-slate-50 border-slate-200 rounded-xl"
                                    />
                                </div>
                                <Select
                                    value={selectedSubject}
                                    onValueChange={setSelectedSubject}
                                >
                                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl">
                                        <SelectValue placeholder="All Subjects" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Subjects
                                        </SelectItem>
                                        <SelectItem value="MATHEMATICS">
                                            Mathematics
                                        </SelectItem>
                                        <SelectItem value="PHYSICS">
                                            Physics
                                        </SelectItem>
                                        <SelectItem value="CHEMISTRY">
                                            Chemistry
                                        </SelectItem>
                                        <SelectItem value="BIOLOGY">
                                            Biology
                                        </SelectItem>
                                        <SelectItem value="COMPUTER_SCIENCE">
                                            Computer Science
                                        </SelectItem>
                                        <SelectItem value="ENGLISH">
                                            English
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center text-sm text-slate-600">
                                    <Filter className="h-4 w-4 mr-2" />
                                    {filteredTutors.length} tutors available
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-slate-500">
                                    <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Online</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                        <span>Offline</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tutors Grid */}
                    {loading ? (
                        <Card className="bg-white border-3 border-black shadow-[4px_4px_0px_0px_black]">
                            <CardContent className="p-12 text-center">
                                <BlockLoader size="lg" className="mx-auto" />
                                <p className="mt-4 text-black font-bold uppercase tracking-wide">
                                    Loading tutors...
                                </p>
                            </CardContent>
                        </Card>
                    ) : filteredTutors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTutors.map((tutor) => (
                                <Card
                                    key={tutor.id}
                                    className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] overflow-hidden hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_black] transition-all duration-300"
                                >
                                    <CardHeader className="pb-4 bg-yellow-100 border-b-4 border-black">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <div className="w-16 h-16 bg-cyan-300 border-3 border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center text-black text-xl font-black">
                                                    {tutor.firstName[0]}
                                                    {tutor.lastName[0]}
                                                </div>
                                                {tutor.isOnline && (
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-black"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-black text-black text-lg uppercase tracking-wide">
                                                    {tutor.firstName}{" "}
                                                    {tutor.lastName}
                                                </h3>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <Star className="h-4 w-4 text-black fill-current" />
                                                    <span className="text-sm font-black text-black">
                                                        {tutor.rating.toFixed(
                                                            1
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-black font-bold bg-green-200 px-2 py-1 border border-black uppercase tracking-wide">
                                                        {tutor.isOnline
                                                            ? "Online"
                                                            : "Offline"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0 bg-white">
                                        {/* Subjects */}
                                        <div className="mb-4">
                                            <div className="flex flex-wrap gap-2">
                                                {tutor.subjects
                                                    .slice(0, 3)
                                                    .map((subject, index) => (
                                                        <Badge
                                                            key={index}
                                                            className="text-xs bg-pink-200 text-black border-2 border-black font-bold uppercase tracking-wide"
                                                        >
                                                            {subject.replace(
                                                                /_/g,
                                                                " "
                                                            )}
                                                        </Badge>
                                                    ))}
                                                {tutor.subjects.length > 3 && (
                                                    <Badge className="text-xs bg-orange-200 text-black border-2 border-black font-bold uppercase tracking-wide">
                                                        +
                                                        {tutor.subjects.length -
                                                            3}{" "}
                                                        more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        {tutor.bio && (
                                            <p className="text-sm text-black font-bold mb-4 line-clamp-2">
                                                {tutor.bio}
                                            </p>
                                        )}

                                        {/* Ask Doubt Button */}
                                        <Button
                                            onClick={() =>
                                                handleAskDoubt(tutor.id)
                                            }
                                            disabled={
                                                loadingSession ||
                                                (sessionStatus &&
                                                    !sessionStatus.canAskDoubt)
                                            }
                                            className={`w-full font-black py-3 border-3 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all uppercase tracking-wide ${
                                                sessionStatus?.canAskDoubt &&
                                                !loadingSession
                                                    ? "bg-cyan-300 hover:bg-cyan-400 text-black"
                                                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                                            }`}
                                        >
                                            <MessageCircle className="h-4 w-4 mr-2" />
                                            {loadingSession
                                                ? "Loading..."
                                                : !sessionStatus
                                                ? "Ask a Doubt"
                                                : !sessionStatus.hasActiveSubscription
                                                ? "Subscribe Required"
                                                : !sessionStatus.canAskDoubt
                                                ? "Limit Reached"
                                                : "Ask a Doubt"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                    No Tutors Found
                                </h3>
                                <p className="text-slate-600 mb-6">
                                    No tutors match your search criteria. Try
                                    adjusting your filters.
                                </p>
                                <Button
                                    onClick={() => {
                                        setSearchQuery("")
                                        setSelectedSubject("all")
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    )
}
