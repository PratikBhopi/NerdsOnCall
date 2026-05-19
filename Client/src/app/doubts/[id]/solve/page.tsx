"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft,
    BookOpen,
    User,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle,
    Loader2,
    Video,
    Upload,
    X,
    Paperclip,
} from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { getUserFriendlyErrorMessage } from "@/utils/errorMessages"

interface Doubt {
    id: number
    title: string
    description: string
    subject: string
    priority: string
    status: string
    createdAt: string
    student: {
        firstName: string
        lastName: string
        email: string
    }
    attachments?: string[]
}

export default function SolveDoubtPage() {
    const { user } = useAuth()
    const router = useRouter()
    const params = useParams()
    const doubtId = params.id as string

    const [doubt, setDoubt] = useState<Doubt | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [solutionData, setSolutionData] = useState({
        solutionDescription: "",
    })
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        if (doubtId && user?.role === "TUTOR") {
            fetchDoubt()
        }
    }, [doubtId, user])

    const fetchDoubt = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/api/doubts/${doubtId}`)
            setDoubt(response.data)
        } catch (error) {
            console.error("Error fetching doubt:", error)
            toast.error("Failed to load doubt details")
            router.push("/my-students")
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setSolutionData((prev) => ({ ...prev, [field]: value }))
    }

    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("video/")) {
            toast.error("Please upload a valid video file")
            return
        }

        const maxSize = 100 * 1024 * 1024 // 100MB
        if (file.size > maxSize) {
            toast.error("Maximum file size is 100MB")
            return
        }

        setVideoFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!solutionData.solutionDescription.trim()) {
            toast.error("Please provide a solution description")
            return
        }

        setSubmitting(true)
        try {
            const formData = new FormData()
            formData.append(
                "solutionDescription",
                solutionData.solutionDescription
            )

            if (videoFile) {
                formData.append("videoFile", videoFile)
            }

            await api.post(`/api/doubts/${doubtId}/solution`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            toast.success("Solution submitted successfully!")
            router.push("/my-students")
        } catch (error: any) {
            console.error("Error submitting solution:", error)
            const errorMessage = getUserFriendlyErrorMessage(error, "general")
            toast.error(errorMessage)
        } finally {
            setSubmitting(false)
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "LOW":
                return "bg-green-100 text-green-800 border-green-200"
            case "MEDIUM":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "HIGH":
                return "bg-orange-100 text-orange-800 border-orange-200"
            case "URGENT":
                return "bg-red-100 text-red-800 border-red-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    if (!user || user.role !== "TUTOR") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">
                            Access Denied
                        </h2>
                        <p className="text-slate-600 mb-4">
                            This page is only available to tutors.
                        </p>
                        <Button onClick={() => router.push("/dashboard")}>
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-green-200">
                <Navbar />
                <div className="pt-20 pb-10">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Card className="bg-yellow-400">
                            <CardContent className="p-12 text-center">
                                <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin mx-auto bg-white shadow-[4px_4px_0px_0px_black]"></div>
                                <p className="mt-6 text-black text-xl font-black uppercase tracking-wide bg-white px-4 py-2 border-3 border-black shadow-[3px_3px_0px_0px_black]">
                                    Loading doubt details...
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    if (!doubt) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="pt-20 pb-10">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Card>
                            <CardContent className="p-12 text-center">
                                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                    Doubt Not Found
                                </h3>
                                <p className="text-slate-600 mb-4">
                                    The doubt you&apos;re looking for
                                    doesn&apos;t exist or you don&apos;t have
                                    permission to access it.
                                </p>
                                <Link href="/my-students">
                                    <Button>Back to Student Requests</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
            <Navbar />
            <div className="pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <Link href="/my-students">
                        <Button
                            variant="ghost"
                            className="mb-6 text-slate-600 hover:text-slate-800 hover:bg-white/50"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Student Requests
                        </Button>
                    </Link>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Doubt Details */}
                        <Card className="bg-white shadow-2xl border-0 rounded-3xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <BookOpen className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold text-white">
                                            Student Doubt
                                        </CardTitle>
                                        <p className="text-blue-100 text-sm">
                                            Review and provide solution
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {/* Badges */}
                                <div className="flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {doubt.subject.replace(/_/g, " ")}
                                    </Badge>
                                    <Badge
                                        className={`text-xs border ${getPriorityColor(
                                            doubt.priority
                                        )}`}
                                    >
                                        {doubt.priority}
                                    </Badge>
                                </div>

                                {/* Title */}
                                <div>
                                    <h3 className="font-semibold text-slate-800 text-lg mb-2">
                                        {doubt.title}
                                    </h3>
                                </div>

                                {/* Description */}
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">
                                        Description:
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {doubt.description}
                                    </p>
                                </div>

                                {/* Student Info */}
                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-slate-700 mb-2">
                                        Student:
                                    </h4>
                                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                                        <User className="h-4 w-4" />
                                        <span>
                                            {doubt.student.firstName}{" "}
                                            {doubt.student.lastName}
                                        </span>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="flex items-center space-x-2 text-sm text-slate-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        Asked on{" "}
                                        {new Date(
                                            doubt.createdAt
                                        ).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Attachments */}
                                {doubt.attachments &&
                                    doubt.attachments.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-slate-700 mb-2">
                                                Attachments:
                                            </h4>
                                            <div className="space-y-2">
                                                {doubt.attachments.map(
                                                    (attachment, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <Paperclip className="h-4 w-4 text-slate-500" />
                                                            <a
                                                                href={
                                                                    attachment
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                                                            >
                                                                Attachment{" "}
                                                                {index + 1}
                                                            </a>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </CardContent>
                        </Card>

                        {/* Solution Form */}
                        <Card className="bg-white shadow-2xl border-0 rounded-3xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 px-6 py-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold text-white">
                                            Provide Solution
                                        </CardTitle>
                                        <p className="text-green-100 text-sm">
                                            Help the student learn
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    {/* Solution Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-3">
                                            Solution Description{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <Textarea
                                            placeholder="Provide a detailed explanation of the solution..."
                                            value={
                                                solutionData.solutionDescription
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "solutionDescription",
                                                    e.target.value
                                                )
                                            }
                                            className="min-h-[150px] bg-slate-50 border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 resize-none"
                                            maxLength={5000}
                                        />
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-xs text-slate-500">
                                                {
                                                    solutionData
                                                        .solutionDescription
                                                        .length
                                                }
                                                /5000 characters
                                            </p>
                                        </div>
                                    </div>

                                    {/* Video Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-3">
                                            Solution Video{" "}
                                            <span className="text-slate-500">
                                                (Optional)
                                            </span>
                                        </label>

                                        <div className="border-4 border-black bg-white p-6 hover:bg-yellow-100 transition-colors shadow-[8px_8px_0px_0px_black]">
                                            {previewUrl ? (
                                                <div className="space-y-4">
                                                    <video
                                                        src={previewUrl}
                                                        controls
                                                        className="w-full max-h-64 bg-black border-4 border-black"
                                                    >
                                                        Your browser does not
                                                        support the video tag.
                                                    </video>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                                            <span className="text-sm font-black text-black uppercase">
                                                                {
                                                                    videoFile?.name
                                                                }
                                                            </span>
                                                            <span className="text-xs text-black font-bold">
                                                                (
                                                                {(
                                                                    (videoFile?.size ||
                                                                        0) /
                                                                    (1024 *
                                                                        1024)
                                                                ).toFixed(
                                                                    1
                                                                )}{" "}
                                                                MB)
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setVideoFile(
                                                                    null
                                                                )
                                                                setPreviewUrl(
                                                                    null
                                                                )
                                                            }}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-400 border-4 border-black text-black font-black uppercase tracking-wide hover:bg-red-500 transition-colors shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black]"
                                                            disabled={
                                                                submitting
                                                            }
                                                        >
                                                            <X className="h-4 w-4" />
                                                            REMOVE
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer flex flex-col items-center justify-center gap-4">
                                                    <div className="p-6 bg-blue-300 border-4 border-black text-black shadow-[4px_4px_0px_0px_black]">
                                                        <Upload className="h-10 w-10" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xl font-black text-black uppercase tracking-wide">
                                                            UPLOAD VIDEO
                                                            SOLUTION
                                                        </p>
                                                        <p className="text-sm text-black font-bold mt-2">
                                                            MP4, WebM or MOV
                                                            (max 100MB)
                                                        </p>
                                                    </div>
                                                    <div className="px-6 py-3 bg-green-400 border-4 border-black text-black font-black uppercase tracking-wide hover:bg-green-500 transition-colors shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black]">
                                                        CHOOSE VIDEO FILE
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        className="hidden"
                                                        onChange={
                                                            handleVideoFileChange
                                                        }
                                                        disabled={submitting}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2 flex items-start gap-2">
                                            <span className="text-blue-600 mt-0.5">
                                                🎥
                                            </span>
                                            Record yourself explaining the
                                            solution step by step. This helps
                                            students understand better.
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 w-full max-w-full overflow-hidden">
                                        <Link
                                            href="/my-students"
                                            className="w-full sm:w-auto"
                                        >
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={submitting}
                                                className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-white border-4 border-black text-black font-black uppercase tracking-wide hover:bg-gray-200 transition-colors shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] text-sm sm:text-base min-w-0 flex-shrink"
                                            >
                                                CANCEL
                                            </Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            disabled={
                                                submitting ||
                                                !solutionData.solutionDescription.trim()
                                            }
                                            className="w-full sm:w-auto bg-green-400 border-4 border-black text-black font-black uppercase tracking-wide hover:bg-green-500 transition-colors shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] px-4 sm:px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_black] text-sm sm:text-base min-w-0 flex-shrink"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                    SUBMITTING...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    SUBMIT SOLUTION
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
