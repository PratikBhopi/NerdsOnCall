import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

export interface DashboardStats {
    sessionsAttended: number
    hoursLearned: number
    activeSessions: number
    openQuestions: number
    favoriteTutors: number
    totalCost: number
    recentActivities: RecentActivity[]
}

export interface RecentActivity {
    title: string
    subtitle: string
    time: string
    icon: string
    color: string
    bg: string
    timestamp: string
}

export function useDashboard() {
    const { user } = useAuth()
    const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
        null
    )
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDashboardData = async () => {
        // Don't fetch if user is not loaded or not a student
        if (!user) {
            console.log("⏳ User not loaded yet, skipping dashboard fetch")
            setLoading(false)
            return
        }

        if (user.role !== "STUDENT") {
            console.log("User is not a student, skipping dashboard fetch")
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            console.log(
                "[MANUAL] Fetching dashboard data for student:",
                user.firstName,
                user.lastName
            )
            console.log(
                "Fetch triggered at:",
                new Date().toLocaleTimeString()
            )

            const response = await api.get("/api/dashboard/student")
            console.log("Dashboard data received:", response.data)

            setDashboardData(response.data)
        } catch (err: any) {
            console.error("Error fetching dashboard data:", err)

            // Don't treat dashboard errors as authentication failures
            // Only set error state, don't trigger logout
            const errorMessage =
                err.response?.data ||
                err.message ||
                "Failed to fetch dashboard data"
            setError(errorMessage)

            // Set default values on error so dashboard still shows something
            setDashboardData({
                sessionsAttended: 0,
                hoursLearned: 0,
                activeSessions: 0,
                openQuestions: 0,
                favoriteTutors: 0,
                totalCost: 0,
                recentActivities: [],
            })

            // Log the error but don't throw it to prevent auth context from logging out user
            console.warn(
                "Dashboard data fetch failed, using default values:",
                errorMessage
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // DISABLED AUTO-FETCH TO PREVENT LOGIN ISSUES
        // Dashboard data will only load when manually triggered
        console.log("Dashboard hook loaded, auto-fetch disabled")
    }, [user])

    return {
        dashboardData,
        loading,
        error,
        refetch: fetchDashboardData,
    }
}
