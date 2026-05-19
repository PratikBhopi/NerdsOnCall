"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    User,
    Mail,
    Phone,
    Calendar,
    Star,
    BookOpen,
    Clock,
    DollarSign,
    Edit,
    Save,
    X,
    Crown,
    Award,
    TrendingUp,
    Users,
    MessageSquare,
} from "lucide-react"
import { Subject } from "@/types"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

const subjectsList: Subject[] = [
    "MATHEMATICS",
    "PHYSICS",
    "CHEMISTRY",
    "BIOLOGY",
    "COMPUTER_SCIENCE",
    "ENGLISH",
    "HISTORY",
    "GEOGRAPHY",
    "ECONOMICS",
    "ACCOUNTING",
    "STATISTICS",
    "CALCULUS",
    "ALGEBRA",
    "GEOMETRY",
    "TRIGONOMETRY",
]

export default function ProfilePage() {
    const { user } = useAuth()
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [profileData, setProfileData] = useState<any>(null)
    const [editData, setEditData] = useState<any>({})
    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        if (user) {
            fetchProfileData()
            fetchUserStats()
        }
    }, [user])

    const fetchProfileData = async () => {
        try {
            const response = await api.get("/users/profile")
            setProfileData(response.data)
            setEditData({
                firstName: response.data.firstName || "",
                lastName: response.data.lastName || "",
                phoneNumber: response.data.phoneNumber || "",
                bio: response.data.bio || "",
                subjects: response.data.subjects || [],
                hourlyRate: response.data.hourlyRate || "",
            })
        } catch (error) {
            console.error("Error fetching profile:", error)
            toast.error("Failed to load profile data")
        }
    }

    const fetchUserStats = async () => {
        try {
            const response = await api.get(`/users/${user?.id}/stats`)
            setStats(response.data)
        } catch (error) {
            console.error("Error fetching stats:", error)
            // Don't show error toast for stats as it's not critical
        }
    }

    const handleSave = async () => {
        try {
            setLoading(true)
            const response = await api.put("/users/profile", editData)
            setProfileData(response.data)
            setIsEditing(false)
            toast.success("Profile updated successfully!")
        } catch (error: any) {
            console.error("Error updating profile:", error)
            toast.error("Failed to update profile")
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setEditData({
            firstName: profileData?.firstName || "",
            lastName: profileData?.lastName || "",
            phoneNumber: profileData?.phoneNumber || "",
            bio: profileData?.bio || "",
            subjects: profileData?.subjects || [],
            hourlyRate: profileData?.hourlyRate || "",
        })
        setIsEditing(false)
    }

    const handleSubjectToggle = (subject: Subject) => {
        const currentSubjects = editData.subjects || []
        const updatedSubjects = currentSubjects.includes(subject)
            ? currentSubjects.filter((s: Subject) => s !== subject)
            : [...currentSubjects, subject]
        setEditData({ ...editData, subjects: updatedSubjects })
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Please log in to view your profile.</p>
            </div>
        )
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="pt-20 pb-10">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="animate-pulse">
                            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
                            <div className="h-64 bg-slate-200 rounded mb-6"></div>
                            <div className="h-32 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const isTutor = user.role === "TUTOR"

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="pt-20 pb-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                                    My Profile
                                </h1>
                                <p className="text-slate-600">
                                    Manage your account information and
                                    preferences
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                {!isEditing ? (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <div className="flex space-x-2">
                                        <Button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {loading ? "Saving..." : "Save"}
                                        </Button>
                                        <Button
                                            onClick={handleCancel}
                                            variant="outline"
                                            disabled={loading}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Profile Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <User className="h-5 w-5 mr-2" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                First Name
                                            </label>
                                            {isEditing ? (
                                                <Input
                                                    value={editData.firstName}
                                                    onChange={(e) =>
                                                        setEditData({
                                                            ...editData,
                                                            firstName:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="Enter first name"
                                                />
                                            ) : (
                                                <p className="text-slate-800 font-medium">
                                                    {profileData.firstName}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Last Name
                                            </label>
                                            {isEditing ? (
                                                <Input
                                                    value={editData.lastName}
                                                    onChange={(e) =>
                                                        setEditData({
                                                            ...editData,
                                                            lastName:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="Enter last name"
                                                />
                                            ) : (
                                                <p className="text-slate-800 font-medium">
                                                    {profileData.lastName}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Email
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                            <p className="text-slate-800">
                                                {profileData.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Phone Number
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                value={editData.phoneNumber}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        phoneNumber:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Enter phone number"
                                            />
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <Phone className="h-4 w-4 text-slate-400" />
                                                <p className="text-slate-800">
                                                    {profileData.phoneNumber ||
                                                        "Not provided"}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Role
                                        </label>
                                        <Badge
                                            variant={
                                                isTutor
                                                    ? "default"
                                                    : "secondary"
                                            }
                                            className={`w-fit ${
                                                isTutor
                                                    ? "bg-slate-700 text-white"
                                                    : "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            {isTutor && (
                                                <Crown className="w-4 h-4 mr-1" />
                                            )}
                                            {profileData.role}
                                        </Badge>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Member Since
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            <p className="text-slate-800">
                                                {new Date(
                                                    profileData.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tutor-specific Information */}
                            {isTutor && (
                                <>
                                    {/* Bio Section */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <MessageSquare className="h-5 w-5 mr-2" />
                                                Bio
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {isEditing ? (
                                                <Textarea
                                                    value={editData.bio}
                                                    onChange={(e) =>
                                                        setEditData({
                                                            ...editData,
                                                            bio: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Tell students about yourself, your experience, and teaching style..."
                                                    rows={4}
                                                />
                                            ) : (
                                                <p className="text-slate-700">
                                                    {profileData.bio ||
                                                        "No bio provided yet."}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Subjects */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <BookOpen className="h-5 w-5 mr-2" />
                                                Subjects I Teach
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {isEditing ? (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {subjectsList.map(
                                                        (subject) => (
                                                            <label
                                                                key={subject}
                                                                className="flex items-center space-x-2 cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editData.subjects?.includes(
                                                                        subject
                                                                    )}
                                                                    onChange={() =>
                                                                        handleSubjectToggle(
                                                                            subject
                                                                        )
                                                                    }
                                                                    className="rounded border-slate-300"
                                                                />
                                                                <span className="text-sm">
                                                                    {subject.replace(
                                                                        /_/g,
                                                                        " "
                                                                    )}
                                                                </span>
                                                            </label>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {profileData.subjects
                                                        ?.length > 0 ? (
                                                        profileData.subjects.map(
                                                            (
                                                                subject: Subject
                                                            ) => (
                                                                <Badge
                                                                    key={
                                                                        subject
                                                                    }
                                                                    variant="secondary"
                                                                >
                                                                    {subject.replace(
                                                                        /_/g,
                                                                        " "
                                                                    )}
                                                                </Badge>
                                                            )
                                                        )
                                                    ) : (
                                                        <p className="text-slate-500">
                                                            No subjects selected
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Hourly Rate */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <DollarSign className="h-5 w-5 mr-2" />
                                                Hourly Rate
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {isEditing ? (
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-slate-700">
                                                        ₹
                                                    </span>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            editData.hourlyRate
                                                        }
                                                        onChange={(e) =>
                                                            setEditData({
                                                                ...editData,
                                                                hourlyRate:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="Enter hourly rate"
                                                        className="w-32"
                                                    />
                                                    <span className="text-slate-700">
                                                        per hour
                                                    </span>
                                                </div>
                                            ) : (
                                                <p className="text-slate-800 font-medium">
                                                    {profileData.hourlyRate
                                                        ? `₹${profileData.hourlyRate} per hour`
                                                        : "Not set"}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </div>

                        {/* Right Column - Stats & Insights */}
                        <div className="space-y-6">
                            {/* Profile Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Award className="h-5 w-5 mr-2" />
                                        Profile Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                                            {profileData.firstName?.[0]}
                                            {profileData.lastName?.[0]}
                                        </div>
                                        <h3 className="font-semibold text-slate-800">
                                            {profileData.firstName}{" "}
                                            {profileData.lastName}
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            {profileData.role}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600">
                                                Status
                                            </span>
                                            <Badge
                                                variant={
                                                    profileData.isOnline
                                                        ? "default"
                                                        : "secondary"
                                                }
                                                className={
                                                    profileData.isOnline
                                                        ? "bg-green-500 text-white"
                                                        : "bg-slate-200 text-slate-700"
                                                }
                                            >
                                                {profileData.isOnline
                                                    ? "Online"
                                                    : "Offline"}
                                            </Badge>
                                        </div>

                                        {isTutor && (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">
                                                        Rating
                                                    </span>
                                                    <div className="flex items-center space-x-1">
                                                        <Star className="h-4 w-4 text-amber-500 fill-current" />
                                                        <span className="font-medium">
                                                            {profileData.rating?.toFixed(
                                                                1
                                                            ) || "0.0"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">
                                                        Sessions
                                                    </span>
                                                    <span className="font-medium">
                                                        {profileData.totalSessions ||
                                                            0}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">
                                                        Earnings
                                                    </span>
                                                    <span className="font-medium">
                                                        ₹
                                                        {profileData.totalEarnings?.toFixed(
                                                            2
                                                        ) || "0.00"}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Stats */}
                            {stats && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <TrendingUp className="h-5 w-5 mr-2" />
                                            Quick Stats
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {isTutor ? (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">
                                                        This Month
                                                    </span>
                                                    <span className="font-medium">
                                                        {stats.sessionsThisMonth ||
                                                            0}{" "}
                                                        sessions
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">
                                                        This Week
                                                    </span>
                                                    <span className="font-medium">
                                                        {stats.sessionsThisWeek ||
                                                            0}{" "}
                                                        sessions
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">
                                                        Avg Rating
                                                    </span>
                                                    <span className="font-medium">
                                                        {stats.averageRating?.toFixed(
                                                            1
                                                        ) || "N/A"}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">
                                                        Questions Asked
                                                    </span>
                                                    <span className="font-medium">
                                                        {stats.questionsAsked ||
                                                            0}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">
                                                        Doubts Resolved
                                                    </span>
                                                    <span className="font-medium">
                                                        {stats.doubtsResolved ||
                                                            0}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">
                                                        Sessions Attended
                                                    </span>
                                                    <span className="font-medium">
                                                        {stats.sessionsAttended ||
                                                            0}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {isTutor ? (
                                        <>
                                            <Button
                                                onClick={() =>
                                                    router.push("/dashboard")
                                                }
                                                className="w-full"
                                                variant="outline"
                                            >
                                                <Users className="h-4 w-4 mr-2" />
                                                View Dashboard
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    router.push("/my-students")
                                                }
                                                className="w-full"
                                                variant="outline"
                                            >
                                                <BookOpen className="h-4 w-4 mr-2" />
                                                Student Requests
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={() =>
                                                    router.push(
                                                        "/browse-tutors"
                                                    )
                                                }
                                                className="w-full"
                                                variant="outline"
                                            >
                                                <Users className="h-4 w-4 mr-2" />
                                                Browse Tutors
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    router.push("/my-questions")
                                                }
                                                className="w-full"
                                                variant="outline"
                                            >
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                My Questions
                                            </Button>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
