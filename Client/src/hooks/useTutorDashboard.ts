import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { TutorDashboardStats } from "@/types"
import { getUserFriendlyErrorMessage } from "@/utils/errorMessages"

export function useTutorDashboard() {
    const { user } = useAuth()
    const [dashboardData, setDashboardData] =
        useState<TutorDashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDashboardData = async () => {
        // Don't fetch if user is not loaded or not a tutor
        if (!user) {
            console.log(
                "⏳ User not loaded yet, skipping tutor dashboard fetch"
            )
            setLoading(false)
            return
        }

        if (user.role !== "TUTOR") {
            console.log(
                "User is not a tutor, skipping tutor dashboard fetch"
            )
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            console.log(
                "[TUTOR] Fetching dashboard data for tutor:",
                user.firstName,
                user.lastName
            )
            console.log(
                "Fetch triggered at:",
                new Date().toLocaleTimeString()
            )

            const response = await api.get("/api/dashboard/tutor")
            console.log("Tutor dashboard data received:", response.data)

            setDashboardData(response.data)
        } catch (err: any) {
            console.error("Error fetching tutor dashboard data:", err)

            // Don't treat dashboard errors as authentication failures
            // Only set error state, don't trigger logout
            const errorMessage = getUserFriendlyErrorMessage(err, "general")
            setError(errorMessage)

            // Set default values on error so dashboard still shows something
            setDashboardData({
                sessionsTaught: 0,
                hoursTaught: 0,
                totalEarnings: 0,
                rating: 0,
                activeStudents: 0,
                pendingSessions: 0,
                recentActivities: [],
                monthlyGrowth: {
                    sessionsGrowth: 0,
                    hoursGrowth: 0,
                    earningsGrowth: 0,
                },
            })

            // Log the error but don't throw it to prevent auth context from logging out user
            console.warn(
                "Tutor dashboard data fetch failed, using default values:",
                errorMessage
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // DISABLED AUTO-FETCH TO PREVENT LOGIN ISSUES
        // Dashboard data will only load when manually triggered
        console.log("Tutor dashboard hook loaded, auto-fetch disabled")
    }, [user])

    return {
        dashboardData,
        loading,
        error,
        refetch: fetchDashboardData,
    }
}
