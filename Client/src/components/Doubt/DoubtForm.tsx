"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api"
import { Subject } from "@/types"
import { Upload, X, Loader2, HelpCircle } from "lucide-react"
import toast from "react-hot-toast"

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

const priorityList = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "URGENT", label: "Urgent" },
]

interface DoubtFormProps {
    isOpen: boolean
    onClose: () => void
    tutorId?: number // Optional for dashboard flow
    tutorName: string
    onSubmitSuccess?: (doubt: any) => void
    flowType?: "dashboard" | "browse-tutors" // New prop to distinguish flows
}

export function DoubtForm({
    isOpen,
    onClose,
    tutorId,
    tutorName,
    onSubmitSuccess,
    flowType = "browse-tutors",
}: DoubtFormProps) {
    const [title, setTitle] = useState("")
    const [subject, setSubject] = useState<Subject | "">("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState("MEDIUM")
    const [files, setFiles] = useState<File[]>([])

    const [isUploading, setIsUploading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
            setFiles((prev) => [...prev, ...newFiles])
        }
    }

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const uploadFiles = async () => {
        if (files.length === 0) return []

        setIsUploading(true)
        const uploadedUrls: string[] = []

        try {
            for (const file of files) {
                const formData = new FormData()
                formData.append("file", file)

                const response = await api.post("/api/upload", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })

                if (response.data && response.data.url) {
                    uploadedUrls.push(response.data.url)
                } else {
                    throw new Error(`Failed to upload ${file.name}`)
                }
            }

            return uploadedUrls
        } catch (error) {
            console.error("Error uploading files:", error)
            toast.error("Failed to upload one or more files. Please try again.")
            return []
        } finally {
            setIsUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!subject || !title || !description) {
            toast.error("Please fill in all required fields.")
            return
        }

        setIsSubmitting(true)

        try {
            // Upload files if any
            let fileUrls: string[] = []
            if (files.length > 0) {
                fileUrls = await uploadFiles()
                if (fileUrls.length === 0 && files.length > 0) {
                    setIsSubmitting(false)
                    return // Upload failed
                }
            }

            // Create doubt with different logic based on flow type
            const doubtData = {
                subject,
                title,
                description,
                priority,
                attachments: fileUrls,
                // For browse-tutors flow: set preferredTutorId to specific tutor
                // For dashboard flow: set preferredTutorId to null (broadcast to all tutors of subject)
                preferredTutorId: flowType === "browse-tutors" ? tutorId : null,
            }

            console.log("Submitting doubt data:", doubtData)
            const response = await api.post("/api/doubts", doubtData)

            toast.success("Your doubt has been sent to the tutor successfully!")

            // Reset form
            setTitle("")
            setSubject("")
            setDescription("")
            setPriority("MEDIUM")
            setFiles([])

            if (onSubmitSuccess) {
                onSubmitSuccess(response.data) // Pass the created doubt data
            }

            onClose()
        } catch (error) {
            console.error("Error submitting doubt:", error)
            toast.error("Failed to submit your doubt. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[650px] neo-card">
                <DialogHeader className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] -m-6 mb-6 p-6 border-3 border-black shadow-[4px_4px_0px_0px_black]">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-[hsl(var(--accent))] border-2 border-black shadow-[2px_2px_0px_0px_black] flex items-center justify-center">
                            <HelpCircle className="h-6 w-6 text-black" strokeWidth={2.5} />
                        </div>
                        <div>
                            <DialogTitle className="text-[hsl(var(--primary-foreground))] text-xl font-bold">
                                {flowType === "dashboard"
                                    ? "Ask Your Question"
                                    : `Ask ${tutorName}`}
                            </DialogTitle>
                            <p className="text-[hsl(var(--primary-foreground))] text-sm font-semibold opacity-90">
                                Get expert help with your studies
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 p-1">
                    <div className="space-y-2">
                        <Label
                            htmlFor="subject"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Subject *
                        </Label>
                        <Select
                            value={subject}
                            onValueChange={(value) =>
                                setSubject(value as Subject)
                            }
                        >
                            <SelectTrigger className="neo-select">
                                <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                            <SelectContent className="neo-dropdown-content">
                                {subjectsList.map((subject) => (
                                    <SelectItem
                                        key={subject}
                                        value={subject}
                                        className="neo-dropdown-item"
                                    >
                                        {subject.replace(/_/g, " ")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="title"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Title *
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Brief title of your doubt"
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="description"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Description *
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Explain your doubt in detail"
                            rows={5}
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="priority"
                            className="text-sm font-medium text-[hsl(var(--foreground))]"
                        >
                            Priority
                        </Label>
                        <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger className="neo-select">
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent className="neo-dropdown-content">
                                {priorityList.map((item) => (
                                    <SelectItem
                                        key={item.value}
                                        value={item.value}
                                        className="neo-dropdown-item"
                                    >
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Attachments
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex items-center justify-center">
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/50 dark:hover:bg-blue-900/70 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-md flex items-center transition-colors"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    <span>Upload Files</span>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*,.pdf,.doc,.docx,.txt"
                                    />
                                </label>
                            </div>

                            {files.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between bg-white dark:bg-gray-600 p-3 rounded-md border border-gray-200 dark:border-gray-500"
                                        >
                                            <div className="text-sm truncate max-w-[80%] text-gray-700 dark:text-gray-300">
                                                {file.name}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    removeFile(index)
                                                }
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="mt-6 border-t-3 border-black pt-4 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting || isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                isUploading ||
                                !subject ||
                                !title ||
                                !description
                            }
                            variant="default"
                        >
                            {(isSubmitting || isUploading) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Submit Doubt
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
