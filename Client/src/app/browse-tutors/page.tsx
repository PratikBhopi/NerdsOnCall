"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoCallModal } from "@/components/VideoCall/VideoCallModal";
import {
  Star,
  Search,
  Filter,
  Video,
  Clock,
  Users,
  AlertCircle,
} from "lucide-react";
import { Subject, User } from "@/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
];

export default function BrowseTutorsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tutors, setTutors] = useState<User[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("sessions");

  // Session status for video call limits
  const [sessionStatus, setSessionStatus] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(false);

  useEffect(() => {
    fetchTutors();
    if (user && user.role === "STUDENT") {
      fetchSessionStatus();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortTutors();
  }, [tutors, searchQuery, selectedSubject, sortBy]);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      // Fetch all tutors and do filtering client-side for better responsiveness
      const response = await api.get("/api/tutors", {
        params: {
          onlineOnly: true,
        },
      });
      setTutors(response.data);
    } catch (error) {
      console.error("Error fetching tutors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionStatus = async () => {
    try {
      setLoadingSession(true);
      const response = await api.get("/subscriptions/session-status");
      setSessionStatus(response.data);
    } catch (error: any) {
      console.error("Error fetching session status:", error);
      // Set a default state for no subscription
      setSessionStatus({
        hasActiveSubscription: false,
        message:
          "Unable to load subscription status. Please try refreshing the page.",
        canAskDoubt: false,
        sessionsUsed: 0,
        sessionsLimit: 0,
        sessionsRemaining: 0,
        planName: "Unknown",
        planType: "UNKNOWN",
      });

      // Show error toast only if it's not a 401 or 400 (which might mean no subscription)
      if (error.response?.status !== 401 && error.response?.status !== 400) {
        toast.error("Failed to load subscription status");
      }
    } finally {
      setLoadingSession(false);
    }
  };

  const filterAndSortTutors = useCallback(() => {
    console.log("Filtering tutors:", {
      totalTutors: tutors.length,
      selectedSubject,
      sortBy,
      searchQuery,
    });

    let filtered = [...tutors];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (tutor) =>
          `${tutor.firstName} ${tutor.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          tutor.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tutor.subjects?.some((subject) =>
            subject
              .toLowerCase()
              .replace(/_/g, " ")
              .includes(searchQuery.toLowerCase())
          )
      );
    }

    // Filter by subject
    if (selectedSubject !== "all") {
      filtered = filtered.filter((tutor) =>
        tutor.subjects?.includes(selectedSubject as Subject)
      );
    }

    // Sort tutors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "sessions":
          return (b.totalSessions || 0) - (a.totalSessions || 0);
        default:
          return (b.rating || 0) - (a.rating || 0);
      }
    });

    console.log("Filtered result:", {
      filteredCount: filtered.length,
      sampleTutor: filtered[0]
        ? {
            name: `${filtered[0].firstName} ${filtered[0].lastName}`,
            subjects: filtered[0].subjects,
            rating: filtered[0].rating,
          }
        : null,
    });

    setFilteredTutors(filtered);
  }, [tutors, searchQuery, selectedSubject, sortBy]);

  const [selectedTutor, setSelectedTutor] = useState<User | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  const handleConnectTutor = (tutor: User) => {
    // If session status is not loaded yet, allow the attempt (backend will validate)
    if (loadingSession) {
      toast.error("Please wait while we load your subscription status...");
      return;
    }

    // Check session limits before allowing video call
    if (sessionStatus && !sessionStatus.hasActiveSubscription) {
      toast.error(
        "You need an active subscription to start video calls. Please subscribe to a plan first."
      );
      router.push("/pricing");
      return;
    }

    if (sessionStatus && !sessionStatus.canAskDoubt) {
      toast.error(
        `Daily session limit reached! You have used ${sessionStatus.sessionsUsed} out of ${sessionStatus.sessionsLimit} allowed sessions for today. This limit is shared between doubts and video calls. Your limit will reset at 12:00 AM.`
      );
      return;
    }

    // If all checks pass, proceed with video call
    setSelectedTutor(tutor);
    setIsCallModalOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to browse tutors.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Browse Available Tutors
            </h1>
            <p className="text-slate-600">
              Connect with online tutors ready to help you right now
            </p>
          </div>

          {/* Session Status for Students */}
          {user?.role === "STUDENT" && !loadingSession && sessionStatus && (
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
                          {sessionStatus.planName} Plan
                        </span>
                      </div>
                      <div className="text-sm text-slate-600">
                        {sessionStatus.sessionsUsed} /{" "}
                        {sessionStatus.sessionsLimit} sessions used today
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-slate-700">
                        {sessionStatus.sessionsRemaining} remaining
                      </div>
                      {!sessionStatus.canAskDoubt && (
                        <Badge variant="destructive" className="text-xs">
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
                    <Button
                      size="sm"
                      className="bg-blue-400 border-4 border-black text-black font-black uppercase tracking-wide hover:bg-blue-500 transition-colors shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black]"
                      onClick={() => router.push("/pricing")}
                    >
                      Subscribe Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Search tutors by name or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjectsList.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
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
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-slate-200 rounded mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tutors Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Tutor Cards */}
              {filteredTutors.map((tutor) => (
                <Card
                  key={tutor.id}
                  className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_black] transition-all duration-200 group"
                >
                  <CardContent className="p-6">
                    {/* Header with Avatar and Name */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-pink-300 border-4 border-black flex items-center justify-center text-black font-black text-lg shadow-[4px_4px_0px_0px_black] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-[6px_6px_0px_0px_black] transition-all">
                          {tutor.firstName?.[0]}
                          {tutor.lastName?.[0]}
                        </div>
                        {tutor.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-black animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Link href={`/profile/${tutor.id}`}>
                            <h3 className="font-semibold text-slate-800 truncate hover:text-blue-600 cursor-pointer transition-colors">
                              {tutor.firstName} {tutor.lastName}
                            </h3>
                          </Link>
                          {tutor.isOnline && (
                            <div className="w-2 h-2 bg-green-400 border border-black flex-shrink-0"></div>
                          )}
                        </div>
                        {/* <div className="flex items-center space-x-1 mt-1">
                                                    <Star className="h-3 w-3 text-amber-500 fill-current" />
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {tutor.rating?.toFixed(
                                                            1
                                                        ) || "0.0"}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        (
                                                        {tutor.totalSessions ||
                                                            0}
                                                        )
                                                    </span>
                                                </div> */}
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {tutor.bio ||
                        "Experienced tutor ready to help you succeed."}
                    </p>

                    {/* Subjects */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {tutor.subjects?.slice(0, 2).map((subject) => (
                          <Badge
                            key={subject}
                            variant="secondary"
                            className="text-xs px-2 py-1"
                          >
                            {subject.replace(/_/g, " ")}
                          </Badge>
                        ))}
                        {(tutor.subjects?.length || 0) > 2 && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-1"
                          >
                            +{(tutor.subjects?.length || 0) - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4 text-xs text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Online</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleConnectTutor(tutor)}
                      className="w-full bg-green-400 border-4 border-black text-black font-black uppercase tracking-wide hover:bg-green-500 transition-colors shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black]"
                      size="sm"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      🚀 Start Video Call
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && filteredTutors.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  No tutors found
                </h3>
                <p className="text-slate-600 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSubject("all");
                    setSortBy("rating");
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Video Call Modal */}
      {selectedTutor && (
        <VideoCallModal
          isOpen={isCallModalOpen}
          onClose={() => setIsCallModalOpen(false)}
          tutorId={selectedTutor.id}
          tutorName={`${selectedTutor.firstName} ${selectedTutor.lastName}`}
          sessionId={`tutor_${selectedTutor.id}_student_${
            user.id
          }_${Date.now()}`}
        />
      )}
      <Footer />
    </div>
  );
}
