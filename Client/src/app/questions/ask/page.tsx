"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Loader2,
    ArrowLeft,
    HelpCircle,
    BookOpen,
    FileText,
    Upload,
    X,
    Image as ImageIcon,
} from "lucide-react"
import { BlockLoader } from "@/components/ui/Loader"
import { api } from "@/lib/api"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"
import { getUserFriendlyErrorMessage } from "@/utils/errorMessages"

// These should match the backend Subject enum exactly
const subjects = [
    { value: "MATHEMATICS", label: "Mathematics", icon: "📐" },
    { value: "PHYSICS", label: "Physics", icon: "⚛️" },
    { value: "CHEMISTRY", label: "Chemistry", icon: "🧪" },
    { value: "BIOLOGY", label: "Biology", icon: "🧬" },
    { value: "COMPUTER_SCIENCE", label: "Computer Science", icon: "💻" },
    { value: "ENGLISH", label: "English", icon: "📚" },
    { value: "HISTORY", label: "History", icon: "🏛️" },
    { value: "GEOGRAPHY", label: "Geography", icon: "🌍" },
    { value: "ECONOMICS", label: "Economics", icon: "💰" },
    { value: "ACCOUNTING", label: "Accounting", icon: "📊" },
    { value: "STATISTICS", label: "Statistics", icon: "📈" },
    { value: "CALCULUS", label: "Calculus", icon: "∫" },
    { value: "ALGEBRA", label: "Algebra", icon: "𝑥" },
    { value: "GEOMETRY", label: "Geometry", icon: "△" },
    { value: "TRIGONOMETRY", label: "Trigonometry", icon: "∠" },
]

export default function AskQuestionPage() {
    const router = useRouter()
    const { user, logout, isTokenValid } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subject: "",
    })
    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
    const [isUploadingImages, setIsUploadingImages] = useState(false)

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            subject: e.target.value,
        }))
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        handleImageFiles(files)
    }

    const handleImageFiles = (files: File[]) => {
        // Filter for image files only
        const imageFiles = files.filter((file) =>
            file.type.startsWith("image/")
        )

        if (imageFiles.length !== files.length) {
            toast.error("Please select only image files")
            return
        }

        // Limit to 5 images total
        const totalImages = selectedImages.length + imageFiles.length
        if (totalImages > 5) {
            toast.error("You can upload maximum 5 images")
            return
        }

        // Create preview URLs
        const newPreviewUrls = imageFiles.map((file) =>
            URL.createObjectURL(file)
        )

        setSelectedImages((prev) => [...prev, ...imageFiles])
        setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls])
    }

    const removeImage = (index: number) => {
        // Revoke the object URL to free memory
        URL.revokeObjectURL(imagePreviewUrls[index])

        setSelectedImages((prev) => prev.filter((_, i) => i !== index))
        setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))
    }

    const uploadImages = async (): Promise<string[]> => {
        if (selectedImages.length === 0) return []

        setIsUploadingImages(true)
        const uploadedUrls: string[] = []

        try {
            for (const image of selectedImages) {
                const formData = new FormData()
                formData.append("file", image)

                const response = await api.post("/api/upload", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })

                if (response.data && response.data.url) {
                    uploadedUrls.push(response.data.url)
                } else {
                    throw new Error(`Failed to upload ${image.name}`)
                }
            }

            return uploadedUrls
        } catch (error) {
            console.error("Error uploading images:", error)
            toast.error(
                "Failed to upload one or more images. Please try again."
            )
            return []
        } finally {
            setIsUploadingImages(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        console.log("Form submission started")
        console.log("Current user:", user)
        console.log("Form data:", formData)

        if (
            !formData.title.trim() ||
            !formData.description.trim() ||
            !formData.subject
        ) {
            toast.error("Please fill in all required fields")
            return
        }

        if (!user) {
            console.log("No user found, redirecting to login")
            toast.error("You must be logged in to ask a question")
            router.push("/auth/login")
            return
        }

        // Check if token is still valid before making request
        if (!isTokenValid()) {
            console.log("Token expired, logging out user")
            toast.error("Your session has expired. Please log in again.")
            logout()
            router.push("/auth/login")
            return
        }

        console.log("User authenticated, proceeding with submission")
        setIsSubmitting(true)
        const loadingToast = toast.loading("Posting your question...")

        try {
            // First upload images if any
            let imageUrls: string[] = []
            if (selectedImages.length > 0) {
                imageUrls = await uploadImages()
                if (imageUrls.length === 0 && selectedImages.length > 0) {
                    setIsSubmitting(false)
                    toast.error("Failed to upload images. Please try again.", {
                        id: loadingToast,
                    })
                    return
                }
            }

            // Prepare the request payload to match backend DTO
            const requestPayload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                subject: formData.subject, // This should be the enum value like &apos;MATH&apos;, &apos;PHYSICS&apos;, etc.
                imageUrls: imageUrls,
            }

            console.log("Sending question request:", requestPayload)
            const response = await api.post("/api/questions", requestPayload)

            console.log("Question posted successfully:", response.data)
            toast.success("Your question has been posted successfully!", {
                id: loadingToast,
            })

            // Reset form
            setFormData({
                title: "",
                description: "",
                subject: "",
            })

            // Clear images
            imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url))
            setSelectedImages([])
            setImagePreviewUrls([])

            // Navigate to questions page
            router.push("/questions")
        } catch (error: any) {
            console.error("Error submitting question:", error)
            console.error("Error response:", error.response)
            console.error("Error status:", error.response?.status)
            console.error("Error data:", error.response?.data)

            const errorMessage = getUserFriendlyErrorMessage(error, "general")
            toast.error(errorMessage, { id: loadingToast })

            // Handle specific cases that need redirection
            if (error.response?.status === 401) {
                setTimeout(() => router.push("/auth/login"), 2000)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-orange-100">
            <Navbar />
            <main className="flex-grow">
                {/* Hero Section */}
                <div className="bg-black border-b-4 border-black text-white">
                    <div className="container mx-auto px-4 py-12">
                        <div className="max-w-3xl mx-auto text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-300 border-3 border-black shadow-[4px_4px_0px_0px_black] mb-8">
                                <HelpCircle className="h-10 w-10 text-black" />
                            </div>
                            <div className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-wide text-white">
                                Ask a Question
                            </div>
                            <div className="text-xl text-white font-bold max-w-2xl mx-auto uppercase tracking-wide">
                                Get instant help from our community of expert
                                tutors and fellow students
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="container mx-auto px-4 py-12 max-w-3xl">
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] overflow-hidden">
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <button
                                    onClick={() => router.back()}
                                    className="inline-flex items-center gap-2 bg-pink-300 hover:bg-pink-400 text-black border-3 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all font-bold px-4 py-2 uppercase tracking-wide"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Title */}
                                <div className="space-y-4">
                                    <label
                                        htmlFor="title"
                                        className="flex items-center gap-3 text-lg font-black text-black uppercase tracking-wide"
                                    >
                                        <FileText className="h-6 w-6 text-black" />
                                        Question Title *
                                    </label>
                                    <input
                                        id="title"
                                        name="title"
                                        type="text"
                                        className="w-full px-4 py-4 border-3 border-black shadow-[4px_4px_0px_0px_black] focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[6px_6px_0px_0px_black] transition-all font-bold text-black placeholder:text-gray-600"
                                        placeholder="What's your question? Be specific and clear."
                                        value={formData.title}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-sm text-black font-bold flex items-start gap-2 uppercase tracking-wide">
                                        <span className="text-black mt-0.5">
                                            💡
                                        </span>
                                        Keep it clear and concise, like
                                        you&apos;re asking a friend.
                                    </p>
                                </div>

                                {/* Subject */}
                                <div className="space-y-4">
                                    <label
                                        htmlFor="subject"
                                        className="flex items-center gap-3 text-lg font-black text-black uppercase tracking-wide"
                                    >
                                        <BookOpen className="h-6 w-6 text-black" />
                                        Subject *
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleSubjectChange}
                                        disabled={isSubmitting}
                                        className="w-full px-4 py-4 border-3 border-black shadow-[4px_4px_0px_0px_black] focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[6px_6px_0px_0px_black] transition-all font-bold text-black bg-white"
                                    >
                                        <option value="">
                                            Select a subject
                                        </option>
                                        {subjects.map((subject) => (
                                            <option
                                                key={subject.value}
                                                value={subject.value}
                                            >
                                                {subject.icon} {subject.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Description */}
                                <div className="space-y-4">
                                    <label
                                        htmlFor="description"
                                        className="flex items-center gap-3 text-lg font-black text-black uppercase tracking-wide"
                                    >
                                        <FileText className="h-6 w-6 text-black" />
                                        Details *
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={8}
                                        className="w-full px-4 py-4 border-3 border-black shadow-[4px_4px_0px_0px_black] resize-none focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[6px_6px_0px_0px_black] transition-all font-bold text-black placeholder:text-gray-600 bg-white"
                                        placeholder="Include all the information someone would need to answer your question. Be as detailed as possible..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-sm text-black font-bold flex items-start gap-2 uppercase tracking-wide">
                                        <span className="text-black mt-0.5">
                                            📝
                                        </span>
                                        The more details you provide, the better
                                        answers you&apos;ll receive.
                                    </p>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 text-lg font-black text-black uppercase tracking-wide">
                                        <ImageIcon className="h-6 w-6 text-black" />
                                        Images (Optional)
                                    </label>

                                    {/* Upload Area */}
                                    <div className="border-3 border-black border-dashed bg-green-100 p-6 text-center hover:bg-green-200 transition-colors shadow-[4px_4px_0px_0px_black]">
                                        <input
                                            type="file"
                                            id="image-upload"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                            disabled={
                                                isSubmitting ||
                                                isUploadingImages
                                            }
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="cursor-pointer flex flex-col items-center gap-3"
                                        >
                                            <Upload className="h-10 w-10 text-black" />
                                            <div>
                                                <p className="text-black font-bold uppercase tracking-wide">
                                                    Click to upload images or
                                                    drag and drop
                                                </p>
                                                <p className="text-sm text-black font-bold">
                                                    PNG, JPG, GIF up to 10MB
                                                    each (max 5 images)
                                                </p>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Image Previews */}
                                    {imagePreviewUrls.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                            {imagePreviewUrls.map(
                                                (url, index) => (
                                                    <div
                                                        key={index}
                                                        className="relative group"
                                                    >
                                                        <img
                                                            src={url}
                                                            alt={`Preview ${
                                                                index + 1
                                                            }`}
                                                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeImage(
                                                                    index
                                                                )
                                                            }
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            disabled={
                                                                isSubmitting ||
                                                                isUploadingImages
                                                            }
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}

                                    <p className="text-sm text-gray-600 flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5">
                                            🖼️
                                        </span>
                                        Add images to help tutors understand
                                        your question better.
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-4 pt-8 border-t-4 border-black">
                                    <button
                                        type="button"
                                        className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-black border-3 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] disabled:opacity-50 font-black transition-all uppercase tracking-wide"
                                        onClick={() => router.back()}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-cyan-300 hover:bg-cyan-400 text-black border-3 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] disabled:opacity-50 flex items-center font-black transition-all uppercase tracking-wide"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <BlockLoader
                                                    size="sm"
                                                    className="mr-2"
                                                />
                                                Posting Question...
                                            </>
                                        ) : (
                                            <>
                                                <HelpCircle className="h-5 w-5 mr-2" />
                                                Post Question
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
