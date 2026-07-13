"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Paperclip,
  Loader2,
} from "lucide-react";
import { BlockLoader } from "@/components/ui/Loader";
import toast from "react-hot-toast";
import { getUserFriendlyErrorMessage } from "@/utils/errorMessages";

// All available subjects (fallback when no tutor is selected)
const ALL_SUBJECTS = [
  { value: "MATHEMATICS", label: "Mathematics" },
  { value: "PHYSICS", label: "Physics" },
  { value: "CHEMISTRY", label: "Chemistry" },
  { value: "BIOLOGY", label: "Biology" },
  { value: "COMPUTER_SCIENCE", label: "Computer Science" },
  { value: "ENGLISH", label: "English" },
  { value: "HISTORY", label: "History" },
  { value: "GEOGRAPHY", label: "Geography" },
  { value: "ECONOMICS", label: "Economics" },
  { value: "ACCOUNTING", label: "Accounting" },
  { value: "STATISTICS", label: "Statistics" },
  { value: "CALCULUS", label: "Calculus" },
  { value: "ALGEBRA", label: "Algebra" },
  { value: "GEOMETRY", label: "Geometry" },
  { value: "TRIGONOMETRY", label: "Trigonometry" },
];

// Helper function to convert subject enum to display format
const formatSubjectLabel = (subject: string) => {
  return subject
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const PRIORITIES = [
  { value: "LOW", label: "Low", color: "bg-green-100 text-green-800" },
  {
    value: "MEDIUM",
    label: "Medium",
    color: "bg-yellow-100 text-yellow-800",
  },
  { value: "HIGH", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "URGENT", label: "Urgent", color: "bg-red-100 text-red-800" },
];

export default function AskQuestionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tutorId = searchParams.get("tutorId");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [loadingTutor, setLoadingTutor] = useState(false);
  const [tutorSubjects, setTutorSubjects] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    priority: "MEDIUM",
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  // Fetch tutor information if tutorId is provided
  useEffect(() => {
    if (tutorId) {
      fetchTutorInfo();
    } else {
      // If no tutor is selected, use all subjects
      setTutorSubjects(ALL_SUBJECTS);
    }
  }, [tutorId]);

  const fetchTutorInfo = async () => {
    if (!tutorId) return;

    try {
      setLoadingTutor(true);
      const response = await api.get(`/users/${tutorId}`);
      const tutorData = response.data;
      setSelectedTutor(tutorData);

      // Extract tutor's subjects and format them for the dropdown
      if (tutorData.subjects && tutorData.subjects.length > 0) {
        const formattedSubjects = tutorData.subjects.map((subject: string) => ({
          value: subject,
          label: formatSubjectLabel(subject),
        }));
        setTutorSubjects(formattedSubjects);
        console.log("Tutor subjects:", formattedSubjects);
      } else {
        // If tutor has no subjects, use all subjects as fallback
        setTutorSubjects(ALL_SUBJECTS);
        console.log("Tutor has no subjects, using all subjects as fallback");
      }
    } catch (error) {
      console.error("Error fetching tutor info:", error);
      toast.error("Failed to load tutor information");
      // Use all subjects as fallback on error
      setTutorSubjects(ALL_SUBJECTS);
    } finally {
      setLoadingTutor(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + attachments.length > 5) {
      toast.error("Maximum 5 files allowed");
      return;
    }
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.subject
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // First upload attachments if any
      let attachmentUrls: string[] = [];
      if (attachments.length > 0) {
        try {
          const uploadPromises = attachments.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            const uploadResponse = await api.post("/api/upload", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });
            return uploadResponse.data.url || uploadResponse.data;
          });
          attachmentUrls = await Promise.all(uploadPromises);
        } catch (uploadError) {
          console.warn(
            "File upload failed, proceeding without attachments:",
            uploadError
          );
          attachmentUrls = [];
        }
      }

      // Create doubt with JSON payload
      const doubtData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        priority: formData.priority,
        attachments: attachmentUrls,
        preferredTutorId: tutorId ? parseInt(tutorId) : null,
      };

      await api.post("/api/doubts", doubtData);
      toast.success(
        "Doubt submitted successfully! Your session usage has been updated."
      );
      router.push("/my-questions");
    } catch (error: any) {
      console.error("Error submitting question:", error);
      const errorMessage = getUserFriendlyErrorMessage(error, "general");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 text-slate-600 hover:text-slate-800 hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Main Form Card */}
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] overflow-hidden">
            {/* Header */}
            <div className="bg-black px-8 py-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-cyan-300 border-3 border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white uppercase tracking-wide">
                    Ask Your Question
                  </h1>
                  <p className="text-white text-sm font-bold uppercase tracking-wide">
                    Get expert help with your studies
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Tutor Info */}
            {tutorId && (
              <div className="px-8 py-4 bg-yellow-100 border-b-4 border-black">
                {loadingTutor ? (
                  <div className="flex items-center space-x-3">
                    <BlockLoader size="sm" />
                    <span className="text-black font-bold uppercase tracking-wide">
                      Loading tutor information...
                    </span>
                  </div>
                ) : selectedTutor ? (
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedTutor.firstName?.[0]}
                        {selectedTutor.lastName?.[0]}
                      </div>
                      {selectedTutor.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">
                        Asking doubt to: {selectedTutor.firstName}{" "}
                        {selectedTutor.lastName}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        </div>
                        <span className="text-slate-400">•</span>
                        <span className="text-sm text-slate-600">
                          {selectedTutor.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-600">
                    <span className="text-red-600"></span> Unable to load
                    tutor information
                  </div>
                )}
              </div>
            )}

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Subject */}
              <div className="relative z-50">
                <label className="block text-sm font-black text-black mb-3 uppercase tracking-wide">
                  Subject <span className="text-red-500">*</span>
                  {tutorId && selectedTutor && (
                    <span className="ml-2 text-xs font-normal text-gray-600 normal-case">
                      (Subjects taught by {selectedTutor.firstName}{" "}
                      {selectedTutor.lastName})
                    </span>
                  )}
                </label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => handleInputChange("subject", value)}
                  disabled={loadingTutor}
                >
                  <SelectTrigger className="h-12 bg-white border-3 border-black shadow-[4px_4px_0px_0px_black] text-black font-bold hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue
                      placeholder={
                        loadingTutor
                          ? "Loading subjects..."
                          : "Select a subject"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-3 border-black shadow-[4px_4px_0px_0px_black] z-50 max-h-60 overflow-y-auto">
                    {loadingTutor ? (
                      <SelectItem
                        value="loading"
                        disabled
                        className="text-gray-500"
                      >
                        Loading subjects...
                      </SelectItem>
                    ) : tutorSubjects.length > 0 ? (
                      tutorSubjects.map((subject) => (
                        <SelectItem
                          key={subject.value}
                          value={subject.value}
                          className="hover:bg-yellow-200 focus:bg-yellow-200 cursor-pointer px-3 py-2 text-black font-bold"
                        >
                          {subject.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem
                        value="no-subjects"
                        disabled
                        className="text-gray-500"
                      >
                        No subjects available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-black text-black mb-3 uppercase tracking-wide">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Brief title of your doubt"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="h-12 bg-white border-3 border-black shadow-[4px_4px_0px_0px_black] text-black placeholder:text-gray-600 font-bold focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[6px_6px_0px_0px_black] transition-all"
                  maxLength={200}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-black font-bold">
                    {formData.title.length}/200 characters
                  </p>
                  {formData.title.length > 0 && (
                    <span className="text-xs text-green-600 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Good
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Explain your doubt in detail"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="min-h-[120px] bg-slate-50 border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 resize-none"
                  maxLength={2000}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-slate-500">
                    {formData.description.length}/2000 characters
                  </p>
                  {formData.description.length > 50 && (
                    <span className="text-xs text-green-600 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Detailed
                    </span>
                  )}
                  {formData.description.length < 20 &&
                    formData.description.length > 0 && (
                      <span className="text-xs text-orange-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Add more details
                      </span>
                    )}
                </div>
              </div>

              {/* Priority */}
              <div className="relative z-40">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Priority
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    handleInputChange("priority", value)
                  }
                >
                  <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl text-slate-700 font-medium hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 rounded-xl shadow-xl z-40 max-h-48 overflow-y-auto">
                    {PRIORITIES.map((priority) => (
                      <SelectItem
                        key={priority.value}
                        value={priority.value}
                        className="rounded-lg hover:bg-blue-50 focus:bg-blue-50 cursor-pointer px-3 py-2"
                      >
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`text-xs ${priority.color} border-0`}
                          >
                            {priority.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Attachments
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    <Button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      Upload Files
                    </Button>
                    <p className="text-xs text-slate-500 mt-2">
                      Images, PDFs, Word docs (Max 5 files, 10MB each)
                    </p>
                  </label>
                </div>

                {/* Attachment List */}
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200"
                      >
                        <div className="flex items-center space-x-3">
                          <Paperclip className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-700 font-medium">
                            {file.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-black border-3 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] font-black uppercase tracking-wide transition-all"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formData.title.trim() ||
                    !formData.description.trim() ||
                    !formData.subject
                  }
                  className="bg-cyan-300 hover:bg-cyan-400 text-black px-8 py-3 border-3 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] font-black uppercase tracking-wide transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <BlockLoader size="sm" className="mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Doubt
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
