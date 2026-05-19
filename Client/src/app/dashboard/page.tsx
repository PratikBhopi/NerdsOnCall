"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { useDashboard } from "@/hooks/useDashboard"
import { useTutorDashboard } from "@/hooks/useTutorDashboard"
import { Subscription } from "@/types"
import {
    isSubscriptionValid,
    isSubscriptionExpired,
    getSubscriptionStatusText,
    getSubscriptionStatusVariant,
    formatSubscriptionDisplay,
    getDaysRemaining,
} from "@/lib/subscription"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/Button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BlockLoader } from "@/components/ui/Loader"

import {
    BookOpen,
    Users,
    Clock,
    Star,
    MessageCircle,
    Video,
    Calendar,
    TrendingUp,
    PlusCircle,
    IndianRupee,
    Crown,
    Trophy,
    Target,
    Zap,
    Heart,
    Award,
    Sparkles,
    AlertTriangle,
    BarChart3,
    GraduationCap,
    PlayCircle,
    ArrowRight,
    Bell,
    Search,
    Filter,
    Settings,
    Power,
    CheckCircle,
    XCircle,
    RefreshCw,
} from "lucide-react"

export default function DashboardPage() {
    const { user, loading } = useAuth()
    const [isOnline, setIsOnline] = useState(user?.isOnline || false)
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [subscriptionLoading, setSubscriptionLoading] = useState(false)

    // User role checks
    const isStudent = user?.role === "STUDENT"
    const isTutor = user?.role === "TUTOR"

    // Fetch dashboard data for students
    const {
        dashboardData,
        loading: dashboardLoading,
        error: dashboardError,
        refetch,
    } = useDashboard()

    // Fetch dashboard data for tutors
    const {
        dashboardData: tutorDashboardData,
        loading: tutorDashboardLoading,
        error: tutorDashboardError,
        refetch: tutorRefetch,
    } = useTutorDashboard()

    // Track if we've already fetched data to prevent continuous fetching
    const hasFetchedRef = useRef(false)

    // Fetch subscription data for students
    const fetchSubscription = async () => {
        if (user && user.role === "STUDENT") {
            try {
                setSubscriptionLoading(true)
                const res = await api.get<Subscription | string>(
                    "/subscriptions/my-subscription"
                )
                if (
                    typeof res.data === "object" &&
                    res.data !== null &&
                    "id" in res.data
                ) {
                    setSubscription(res.data as Subscription)
                } else {
                    setSubscription(null)
                }
            } catch {
                setSubscription(null)
            } finally {
                setSubscriptionLoading(false)
            }
        }
    }

    // Fetch data only once when user is ready
    useEffect(() => {
        if (
            user &&
            user.role === "STUDENT" &&
            !loading &&
            !hasFetchedRef.current
        ) {
            console.log(
                "🎯 Dashboard page loaded, fetching student data once..."
            )
            hasFetchedRef.current = true
            refetch()
            fetchSubscription()
        } else if (
            user &&
            user.role === "TUTOR" &&
            !loading &&
            !hasFetchedRef.current
        ) {
            console.log("🎯 Dashboard page loaded, fetching tutor data once...")
            hasFetchedRef.current = true
            tutorRefetch()
        }
    }, [user, loading, refetch, tutorRefetch])

    // Helper function to get icon component from string
    const getIconComponent = (iconName: string) => {
        const icons: { [key: string]: any } = {
            Video,
            BookOpen,
            Star,
            MessageCircle,
            Clock,
            Users,
            CheckCircle,
            XCircle,
        }
        return icons[iconName] || BookOpen
    }

    // Sync local state with user data when user changes
    useEffect(() => {
        if (user) {
            setIsOnline(user.isOnline || false)
        }
    }, [user])

    const handleOnlineStatusToggle = async () => {
        if (updatingStatus) return

        setUpdatingStatus(true)
        try {
            const newStatus = !isOnline
            await api.put(`/users/online-status?isOnline=${newStatus}`)
            setIsOnline(newStatus)
            // Update the user context if needed
            window.location.reload() // Simple refresh to update the user state
        } catch (error) {
            console.error("Error updating online status:", error)
        } finally {
            setUpdatingStatus(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-purple-200">
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-yellow-400 border-4 border-black shadow-[8px_8px_0px_0px_black] flex items-center justify-center animate-bounce">
                        <Crown className="h-12 w-12 text-black" />
                    </div>
                    <p className="text-black text-2xl font-black uppercase tracking-wide bg-white px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_black]">
                        Loading your dashboard...
                    </p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-orange-200 px-4">
                <Card className="bg-red-400 max-w-md mx-auto w-full">
                    <CardHeader className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-black border-4 border-white shadow-[6px_6px_0px_0px_white] flex items-center justify-center">
                            <Crown className="h-10 w-10 text-yellow-400" />
                        </div>
                        <CardTitle className="text-3xl font-black text-black mb-4 uppercase tracking-wide">
                            Access Required
                        </CardTitle>
                        <CardDescription className="text-black text-lg font-bold bg-white px-4 py-2 border-3 border-black shadow-[3px_3px_0px_0px_black]">
                            Please log in to access your premium dashboard
                        </CardDescription>
                    </CardHeader>
                    <div className="flex justify-center mt-6">
                        <Link href="/auth/login">
                            <Button
                                variant="default"
                                className="w-full sm:w-auto"
                            >
                                <Crown className="w-5 h-5 mr-2" />
                                Sign In Now
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        )
    }

    // Get subscription display text with expiration info
    const getSubscriptionDisplay = () => {
        if (subscriptionLoading) return "Loading..."
        return formatSubscriptionDisplay(subscription)
    }

    // Get subscription badge variant based on validity
    const getSubscriptionVariant = () => {
        return getSubscriptionStatusVariant(subscription)
    }

    // Check if subscription needs attention (expired or expiring soon)
    const needsSubscriptionAttention = () => {
        if (!subscription) return true
        if (isSubscriptionExpired(subscription)) return true
        const daysRemaining = getDaysRemaining(subscription)
        return daysRemaining <= 7 // Show warning if 7 days or less remaining
    }

    return (
        <div className="min-h-screen bg-purple-200">
            <Navbar />
            <div className="pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header with mobile optimization */}
                    <div className="mb-10 lg:mb-12">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-0">
                            <div className="px-2 sm:px-0">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black mb-4 leading-tight uppercase tracking-wide">
                                    Welcome back,{" "}
                                    <Link
                                        href={`/profile/${user.id}`}
                                        className="hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform duration-100 cursor-pointer bg-yellow-400 px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_black] inline-block"
                                    >
                                        {user.firstName}
                                    </Link>
                                    !
                                </h1>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                    <Badge
                                        variant={
                                            isTutor
                                                ? "default"
                                                : getSubscriptionVariant()
                                        }
                                        className="w-fit text-base"
                                    >
                                        {isTutor && (
                                            <Crown className="w-5 h-5 mr-2" />
                                        )}
                                        {isTutor
                                            ? "Elite Tutor"
                                            : getSubscriptionDisplay()}
                                    </Badge>
                                    <span className="hidden sm:inline text-black font-bold text-xl">
                                        •
                                    </span>
                                    <span className="text-black text-lg font-bold uppercase tracking-wide">
                                        Dashboard
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                                {/* <Button
                                    variant="outline"
                                    size="sm"
                                    className="group border-slate-300 text-slate-700 hover:bg-slate-50 w-full sm:w-auto"
                                >
                                    <Bell className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                                    Notifications
                                </Button> */}
                                <Link
                                    href={
                                        isStudent
                                            ? "/search-tutors"
                                            : "/create-session"
                                    }
                                >
                                    {/* <Button className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white border-0 group w-full sm:w-auto">
                                        <PlusCircle className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                                        {isStudent
                                            ? "Book Session"
                                            : "Create Session"}
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button> */}
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Load Data Button for Students */}
                    {isStudent && !dashboardData && !dashboardLoading && (
                        <div className="mb-8">
                            <Card className="bg-cyan-300">
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-black text-black mb-2 uppercase tracking-wide">
                                                Welcome to Your Dashboard!
                                            </h3>
                                            <p className="text-black text-base font-bold">
                                                learning statistics and recent
                                                activities.
                                            </p>
                                        </div>
                                        <Button
                                            onClick={refetch}
                                            variant="default"
                                            disabled={dashboardLoading}
                                            className="w-full sm:w-auto"
                                        >
                                            <RefreshCw
                                                className={`w-5 h-5 mr-2 ${
                                                    dashboardLoading
                                                        ? "animate-spin"
                                                        : ""
                                                }`}
                                            />
                                            Load Dashboard Data
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Subscription Warning - Only for Students with subscription issues */}
                    {isStudent && needsSubscriptionAttention() && (
                        <div className="mb-10 lg:mb-12">
                            <Card className="bg-red-300 border-3 border-black shadow-[6px_6px_0px_0px_black]">
                                <CardContent className="p-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-black border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_black]">
                                                <AlertTriangle className="h-6 w-6 text-yellow-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-black mb-2 uppercase tracking-wide">
                                                    {isSubscriptionExpired(
                                                        subscription
                                                    )
                                                        ? "Subscription Expired"
                                                        : "Subscription Expiring Soon"}
                                                </h3>
                                                <p className="text-black text-base font-bold">
                                                    {isSubscriptionExpired(
                                                        subscription
                                                    )
                                                        ? "Your subscription has expired. Renew now to continue accessing our services."
                                                        : `Your subscription expires in ${getDaysRemaining(
                                                              subscription
                                                          )} days. Renew now to avoid service interruption.`}
                                                </p>
                                            </div>
                                        </div>
                                        <Link href="/pricing">
                                            <Button className="bg-black hover:bg-gray-800 text-white font-black border-3 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all uppercase tracking-wide w-full sm:w-auto">
                                                Renew Subscription
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Stats Cards - Only for Students */}
                    {isStudent && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-10 lg:mb-12">
                            <Card className="bg-yellow-300">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-base font-black text-black uppercase tracking-wide">
                                        Sessions Attended
                                    </CardTitle>
                                    <div className="w-12 h-12 bg-black border-3 border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center">
                                        <Video className="h-6 w-6 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-black">
                                        {dashboardLoading ? (
                                            <div className="flex items-center">
                                                <BlockLoader
                                                    size="sm"
                                                    className="mr-3"
                                                />
                                                <span className="text-2xl">
                                                    ...
                                                </span>
                                            </div>
                                        ) : (
                                            dashboardData?.sessionsAttended || 0
                                        )}
                                    </div>
                                    <p className="text-sm text-black font-bold mt-2 uppercase tracking-wide">
                                        Completed sessions
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-pink-300">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-base font-black text-black uppercase tracking-wide">
                                        Hours Learned
                                    </CardTitle>
                                    <div className="w-12 h-12 bg-black border-3 border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-black">
                                        {dashboardLoading ? (
                                            <div className="flex items-center">
                                                <BlockLoader
                                                    size="sm"
                                                    className="mr-3"
                                                />
                                                <span className="text-2xl">
                                                    ...
                                                </span>
                                            </div>
                                        ) : (
                                            `${
                                                dashboardData?.hoursLearned || 0
                                            }h`
                                        )}
                                    </div>
                                    <p className="text-sm text-black font-bold mt-2 uppercase tracking-wide">
                                        Actual learning time
                                    </p>
                                    {dashboardData &&
                                        dashboardData.hoursLearned > 0 && (
                                            <p className="text-sm text-black font-bold mt-2 bg-white px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_black] inline-block">
                                                {Math.round(
                                                    (dashboardData.hoursLearned /
                                                        (dashboardData.sessionsAttended ||
                                                            1)) *
                                                        10
                                                ) / 10}
                                                h avg per session
                                            </p>
                                        )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tutor Stats - Real data from database */}
                    {isTutor && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 lg:mb-10">
                            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-lg group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
                                    <CardTitle className="text-sm font-medium text-blue-700">
                                        Sessions Taught
                                    </CardTitle>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                        <Video className="h-5 w-5 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent className="px-4 sm:px-6">
                                    <div className="text-2xl font-bold text-blue-800">
                                        {tutorDashboardLoading
                                            ? "..."
                                            : tutorDashboardData?.sessionsTaught ||
                                              0}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 shadow-lg group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
                                    <CardTitle className="text-sm font-medium text-purple-700">
                                        Hours Taught
                                    </CardTitle>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent className="px-4 sm:px-6">
                                    <div className="text-2xl font-bold text-purple-800">
                                        {tutorDashboardLoading
                                            ? "..."
                                            : tutorDashboardData?.hoursTaught ||
                                              0}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 shadow-lg group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
                                    <CardTitle className="text-sm font-medium text-emerald-700">
                                        Total Earnings
                                    </CardTitle>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                        <IndianRupee className="h-5 w-5 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent className="px-4 sm:px-6">
                                    <div className="text-2xl font-bold text-emerald-800">
                                        ₹
                                        {tutorDashboardLoading
                                            ? "..."
                                            : Math.round(
                                                  tutorDashboardData?.totalEarnings ||
                                                      0
                                              )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Main Content with improved mobile layout */}
                    <div
                        className={`${
                            isTutor
                                ? "grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
                                : "space-y-6 lg:space-y-8"
                        }`}
                    >
                        {/* Quick Actions Section */}
                        <div
                            className={`${
                                isTutor ? "" : "space-y-6 lg:space-y-8"
                            }`}
                        >
                            {/* Quick Actions with mobile optimization */}
                            <Card className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg h-full">
                                <CardHeader className="px-4 sm:px-6">
                                    <CardTitle className="flex items-center text-slate-800">
                                        <Zap className="w-5 h-5 mr-2 text-amber-500" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 sm:px-6">
                                    <div className="space-y-4">
                                        {isStudent ? (
                                            <>
                                                {/* 2x2 Grid Layout - Fixed 2x2 matrix */}
                                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                                    <Link href="/select-tutor">
                                                        <Button
                                                            variant="outline"
                                                            className="bg-cyan-200 border-3 border-black text-black hover:bg-cyan-300 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_black] h-auto p-2 sm:p-3 flex-col w-full group shadow-[2px_2px_0px_0px_black] transition-all duration-100 min-h-[120px] sm:min-h-[140px] max-h-[120px] sm:max-h-[140px] overflow-hidden"
                                                        >
                                                            <div className="w-10 h-10 bg-black border-2 border-black flex items-center justify-center mb-2 group-hover:scale-110 transition-transform flex-shrink-0">
                                                                <PlusCircle className="h-5 w-5 text-white group-hover:rotate-90 transition-transform" />
                                                            </div>
                                                            <span className="font-black text-sm text-black uppercase tracking-wide mb-1 text-center">
                                                                Ask a Doubt
                                                            </span>
                                                            <span className="text-xs text-black font-bold text-center leading-tight px-1 line-clamp-2">
                                                                Select a tutor
                                                                and get help
                                                            </span>
                                                        </Button>
                                                    </Link>
                                                    <Link href="/my-questions">
                                                        <Button
                                                            variant="outline"
                                                            className="bg-pink-200 border-3 border-black text-black hover:bg-pink-300 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_black] h-auto p-2 sm:p-3 flex-col w-full group shadow-[2px_2px_0px_0px_black] transition-all duration-100 min-h-[120px] sm:min-h-[140px] max-h-[120px] sm:max-h-[140px] overflow-hidden"
                                                        >
                                                            <div className="w-10 h-10 bg-black border-2 border-black flex items-center justify-center mb-2 group-hover:scale-110 transition-transform flex-shrink-0">
                                                                <MessageCircle className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                                                            </div>
                                                            <span className="font-black text-sm text-black uppercase tracking-wide mb-1 text-center">
                                                                My Questions
                                                            </span>
                                                            <span className="text-xs text-black font-bold text-center leading-tight px-1 line-clamp-2">
                                                                Track your
                                                                progress
                                                            </span>
                                                        </Button>
                                                    </Link>
                                                    <Link href="/browse-tutors">
                                                        <Button
                                                            variant="outline"
                                                            className="bg-yellow-200 border-3 border-black text-black hover:bg-yellow-300 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_black] h-auto p-2 sm:p-3 flex-col w-full group shadow-[2px_2px_0px_0px_black] transition-all duration-100 min-h-[120px] sm:min-h-[140px] max-h-[120px] sm:max-h-[140px] overflow-hidden"
                                                        >
                                                            <div className="w-10 h-10 bg-black border-2 border-black flex items-center justify-center mb-2 group-hover:scale-110 transition-transform flex-shrink-0">
                                                                <Users className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                                                            </div>
                                                            <span className="font-black text-sm text-black uppercase tracking-wide mb-1 text-center">
                                                                Find Tutors
                                                            </span>
                                                            <span className="text-xs text-black font-bold text-center leading-tight px-1 line-clamp-2">
                                                                Discover expert
                                                                tutors
                                                            </span>
                                                        </Button>
                                                    </Link>
                                                    <Link href="/my-sessions">
                                                        <Button
                                                            variant="outline"
                                                            className="bg-green-200 border-3 border-black text-black hover:bg-green-300 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_black] h-auto p-2 sm:p-3 flex-col w-full group shadow-[2px_2px_0px_0px_black] transition-all duration-100 min-h-[120px] sm:min-h-[140px] max-h-[120px] sm:max-h-[140px] overflow-hidden"
                                                        >
                                                            <div className="w-10 h-10 bg-black border-2 border-black flex items-center justify-center mb-2 group-hover:scale-110 transition-transform flex-shrink-0">
                                                                <Video className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                                                            </div>
                                                            <span className="font-black text-sm text-black uppercase tracking-wide mb-1 text-center">
                                                                My Sessions
                                                            </span>
                                                            <span className="text-xs text-black font-bold text-center leading-tight px-1 line-clamp-2">
                                                                View learning
                                                                sessions
                                                            </span>
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Link href="/my-students">
                                                    <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 h-auto p-4 flex-col w-full group">
                                                        <Users className="h-6 w-6 mb-2 text-white group-hover:scale-110 transition-transform" />
                                                        <span className="font-semibold">
                                                            Student Requests
                                                        </span>
                                                        <span className="text-xs opacity-90">
                                                            View student doubts
                                                        </span>
                                                    </Button>
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Manage Profile Section - Second Column for Tutors */}
                        {isTutor && (
                            <div>
                                <Card className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg h-full">
                                    <CardHeader className="px-4 sm:px-6">
                                        <CardTitle className="flex items-center text-slate-800">
                                            <Settings className="w-5 h-5 mr-2 text-slate-600" />
                                            Manage Profile
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-4 sm:px-6">
                                        <div className="space-y-4">
                                            {/* Online Status Toggle */}
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                            isOnline
                                                                ? "bg-emerald-500"
                                                                : "bg-slate-400"
                                                        }`}
                                                    >
                                                        <Power className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-slate-700">
                                                            Online Status
                                                        </span>
                                                        <p className="text-xs text-slate-500">
                                                            {isOnline
                                                                ? "Available for students"
                                                                : "Not accepting requests"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant={
                                                        isOnline
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    onClick={
                                                        handleOnlineStatusToggle
                                                    }
                                                    disabled={updatingStatus}
                                                    className={`${
                                                        isOnline
                                                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    {updatingStatus ? (
                                                        <BlockLoader size="sm" />
                                                    ) : (
                                                        <>
                                                            {isOnline ? (
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                            ) : (
                                                                <XCircle className="h-3 w-3 mr-1" />
                                                            )}
                                                            {isOnline
                                                                ? "Online"
                                                                : "Offline"}
                                                        </>
                                                    )}
                                                </Button>
                                            </div>

                                            {/* Availability Info */}
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-start space-x-2">
                                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-white text-xs font-bold">
                                                            i
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-blue-800">
                                                            Visibility Status
                                                        </p>
                                                        <p className="text-xs text-blue-700 mt-1">
                                                            {isOnline
                                                                ? "You are visible to students and can receive connection requests."
                                                                : "You are hidden from student searches. Toggle online to start receiving requests."}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* Recent Activity Section - Full Width */}
                    <div className="mt-6 lg:mt-8">
                        {/* Recent Activity with mobile optimization */}
                        <Card className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg">
                            <CardHeader className="px-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center text-slate-800">
                                        <Clock className="w-5 h-5 mr-2 text-slate-600" />
                                        Recent Activity
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-600 hover:text-slate-800"
                                        onClick={
                                            isStudent ? refetch : tutorRefetch
                                        }
                                        disabled={
                                            isStudent
                                                ? dashboardLoading
                                                : tutorDashboardLoading
                                        }
                                    >
                                        <RefreshCw
                                            className={`w-4 h-4 mr-1 ${
                                                (
                                                    isStudent
                                                        ? dashboardLoading
                                                        : tutorDashboardLoading
                                                )
                                                    ? "animate-spin"
                                                    : ""
                                            }`}
                                        />
                                        Refresh
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6">
                                <div className="space-y-4">
                                    {(
                                        isStudent
                                            ? dashboardLoading
                                            : tutorDashboardLoading
                                    ) ? (
                                        <div className="flex items-center justify-center py-8">
                                            <BlockLoader
                                                size="sm"
                                                className="mr-2"
                                            />
                                            <span className="text-black font-bold uppercase tracking-wide">
                                                Loading activities...
                                            </span>
                                        </div>
                                    ) : (
                                          isStudent
                                              ? dashboardError
                                              : tutorDashboardError
                                      ) ? (
                                        <div className="text-center py-8">
                                            <p className="text-slate-500 mb-2">
                                                Failed to load recent activities
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={
                                                    isStudent
                                                        ? refetch
                                                        : tutorRefetch
                                                }
                                                className="text-xs"
                                            >
                                                <RefreshCw className="w-3 h-3 mr-1" />
                                                Retry
                                            </Button>
                                        </div>
                                    ) : isStudent &&
                                      (!dashboardData?.recentActivities ||
                                          dashboardData.recentActivities
                                              .length === 0) ? (
                                        <div className="text-center py-8">
                                            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                            <p className="text-slate-500 text-sm">
                                                No recent activities
                                            </p>
                                            <p className="text-slate-400 text-xs">
                                                Start a session to see your
                                                activity here
                                            </p>
                                        </div>
                                    ) : isTutor &&
                                      (!tutorDashboardData?.recentActivities ||
                                          tutorDashboardData.recentActivities
                                              .length === 0) ? (
                                        <div className="text-center py-8">
                                            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                            <p className="text-slate-500 text-sm">
                                                No recent activities
                                            </p>
                                            <p className="text-slate-400 text-xs">
                                                Teach a session to see your
                                                activity here
                                            </p>
                                        </div>
                                    ) : (
                                        (isStudent
                                            ? dashboardData?.recentActivities
                                            : tutorDashboardData?.recentActivities
                                        )
                                            ?.slice(0, 3)
                                            .map((activity, index) => {
                                                const IconComponent =
                                                    getIconComponent(
                                                        activity.icon
                                                    )
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                                                    >
                                                        <div
                                                            className={`w-10 h-10 rounded-full ${activity.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                                                        >
                                                            <IconComponent
                                                                className={`h-5 w-5 ${activity.color}`}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-800">
                                                                {activity.title}
                                                            </p>
                                                            <p className="text-sm text-slate-600">
                                                                {
                                                                    activity.subtitle
                                                                }
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                {activity.time}
                                                            </p>
                                                        </div>
                                                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                )
                                            })
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
