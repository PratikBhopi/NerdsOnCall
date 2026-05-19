"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/Button"
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    Monitor,
    MonitorOff,
    Phone,
    PhoneOff,
    MessageSquare,
    PenTool,
    Users,
} from "lucide-react"
import { Responsive, WidthProvider } from "react-grid-layout"

import { ChatPanel } from "@/components/VideoCall/ChatPanel"
import { Canvas } from "@/components/VideoCall/Canvas"
import { IncomingCallNotification } from "@/components/VideoCall/IncomingCallNotification"
import toast from "react-hot-toast"
import { api } from "@/lib/api"
import {
    getUserFriendlyErrorMessage,
    getWebSocketErrorMessage,
} from "@/utils/errorMessages"

// Import CSS for react-grid-layout
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

const ResponsiveGridLayout = WidthProvider(Responsive)

interface VideoCallPageProps {}

export default function VideoCallPage() {
    const { user } = useAuth()
    const router = useRouter()
    const params = useParams()
    const sessionId = params.sessionId as string

    // Video call states
    const [status, setStatus] = useState<string>("Initializing...")
    const [callStatus, setCallStatus] = useState<string>("Idle")
    const [isAudioEnabled, setIsAudioEnabled] = useState(true)
    const [isVideoEnabled, setIsVideoEnabled] = useState(true)
    const [isScreenSharing, setIsScreenSharing] = useState(false)
    const [showWhiteboard, setShowWhiteboard] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [chatMessages, setChatMessages] = useState<any[]>([])
    const [otherUserName, setOtherUserName] = useState("")

    // Focus mode states - Default focus based on user role
    const [focusMode, setFocusMode] = useState<"none" | "video" | "whiteboard">(
        "video" // Always start with video focus for better UX
    )
    const [originalLayouts, setOriginalLayouts] = useState<any>(null)
    const [windowHeight, setWindowHeight] = useState(0)

    // Calculate optimal height based on browser window
    useEffect(() => {
        const updateWindowHeight = () => {
            const height = window.innerHeight
            setWindowHeight(height)
        }

        updateWindowHeight()
        window.addEventListener("resize", updateWindowHeight)
        return () => window.removeEventListener("resize", updateWindowHeight)
    }, [])

    // Calculate grid height units based on window height
    // Control bar is ~80px, header is ~60px, some padding ~40px = ~180px total
    // Each grid unit is roughly windowHeight/12, so we calculate optimal focused height
    const calculateFocusedHeight = () => {
        if (windowHeight === 0) return 12 // fallback
        const availableHeight = windowHeight - 180 // subtract control bar + header + padding
        const gridUnitHeight = windowHeight / 15 // Use 15 units instead of 12 for more granular control
        const optimalGridUnits = Math.floor(availableHeight / gridUnitHeight)
        return Math.min(Math.max(optimalGridUnits, 10), 13) // between 10-13 units for better space usage
    }

    // Update layouts when window height changes
    useEffect(() => {
        if (windowHeight > 0) {
            const focusedHeight = calculateFocusedHeight()
            // Use ALL available height for sidebar, give more to camera and chat
            const totalSidebarHeight = focusedHeight
            const cameraHeight = Math.floor(totalSidebarHeight * 0.4) // 40% for camera
            const chatHeight = Math.floor(totalSidebarHeight * 0.4) // 40% for chat
            const whiteboardHeight =
                totalSidebarHeight - cameraHeight - chatHeight // Remaining for whiteboard

            setLayouts((prevLayouts) => ({
                ...prevLayouts,
                lg: [
                    {
                        i: "remote-video",
                        x: 0,
                        y: 0,
                        w: 9,
                        h: focusedHeight,
                        minW: 6,
                        minH: 6,
                    },
                    {
                        i: "local-video",
                        x: 9,
                        y: 0,
                        w: 3,
                        h: cameraHeight,
                        minW: 2,
                        minH: 2,
                    },
                    {
                        i: "chat",
                        x: 9,
                        y: cameraHeight,
                        w: 3,
                        h: chatHeight,
                        minW: 2,
                        minH: 3,
                    },
                    {
                        i: "whiteboard",
                        x: 9,
                        y: cameraHeight + chatHeight,
                        w: 3,
                        h: whiteboardHeight,
                        minW: 2,
                        minH: 2,
                    },
                ],
            }))
        }
    }, [windowHeight])

    // Grid layout states - Start with video focus layout using dynamic height
    const [layouts, setLayouts] = useState(() => {
        const focusedHeight = calculateFocusedHeight()
        // Use ALL available height for sidebar, give more to camera and chat
        const totalSidebarHeight = focusedHeight
        const cameraHeight = Math.floor(totalSidebarHeight * 0.4) // 40% for camera
        const chatHeight = Math.floor(totalSidebarHeight * 0.4) // 40% for chat
        const whiteboardHeight = totalSidebarHeight - cameraHeight - chatHeight // Remaining for whiteboard
        return {
            lg: [
                {
                    i: "remote-video",
                    x: 0,
                    y: 0,
                    w: 9,
                    h: focusedHeight,
                    minW: 6,
                    minH: 6,
                },
                {
                    i: "local-video",
                    x: 9,
                    y: 0,
                    w: 3,
                    h: cameraHeight,
                    minW: 2,
                    minH: 2,
                },
                {
                    i: "chat",
                    x: 9,
                    y: cameraHeight,
                    w: 3,
                    h: chatHeight,
                    minW: 2,
                    minH: 3,
                },
                {
                    i: "whiteboard",
                    x: 9,
                    y: cameraHeight + chatHeight,
                    w: 3,
                    h: whiteboardHeight,
                    minW: 2,
                    minH: 2,
                },
            ],
            md: [
                { i: "remote-video", x: 0, y: 0, w: 6, h: 6, minW: 4, minH: 4 },
                { i: "local-video", x: 6, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
                { i: "chat", x: 6, y: 3, w: 4, h: 7, minW: 3, minH: 4 },
                { i: "whiteboard", x: 0, y: 6, w: 6, h: 6, minW: 4, minH: 4 },
            ],
            sm: [
                { i: "remote-video", x: 0, y: 0, w: 6, h: 5, minW: 3, minH: 3 },
                { i: "local-video", x: 0, y: 5, w: 3, h: 3, minW: 2, minH: 2 },
                { i: "chat", x: 3, y: 5, w: 3, h: 5, minW: 2, minH: 4 },
                { i: "whiteboard", x: 0, y: 10, w: 6, h: 5, minW: 3, minH: 4 },
            ],
            xs: [
                { i: "remote-video", x: 0, y: 0, w: 4, h: 4, minW: 2, minH: 2 },
                { i: "local-video", x: 0, y: 4, w: 2, h: 2, minW: 1, minH: 1 },
                { i: "chat", x: 2, y: 4, w: 2, h: 4, minW: 1, minH: 3 },
                { i: "whiteboard", x: 0, y: 8, w: 4, h: 4, minW: 2, minH: 3 },
            ],
            xxs: [
                { i: "remote-video", x: 0, y: 0, w: 2, h: 3, minW: 1, minH: 2 },
                { i: "local-video", x: 0, y: 3, w: 1, h: 2, minW: 1, minH: 1 },
                { i: "chat", x: 1, y: 3, w: 1, h: 3, minW: 1, minH: 2 },
                { i: "whiteboard", x: 0, y: 6, w: 2, h: 3, minW: 1, minH: 2 },
            ],
        }
    })

    // Video refs and WebRTC states
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)
    const socketRef = useRef<WebSocket | null>(null)
    const localStreamRef = useRef<MediaStream | null>(null)
    const screenStreamRef = useRef<MediaStream | null>(null)
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
    const isConnectedRef = useRef<boolean>(false)
    const isInCallRef = useRef<boolean>(false)
    const isEndingSessionRef = useRef<boolean>(false) // Prevent duplicate session ending calls
    const isSessionStartedRef = useRef<boolean>(false) // Prevent duplicate session start calls
    const whiteboardSocketRef = useRef<WebSocket | null>(null)

    // Additional states for session management
    const [otherUserId, setOtherUserId] = useState(0)
    const [userRole, setUserRole] = useState<string>("")
    const [waitingForTutor, setWaitingForTutor] = useState(false)
    const [tutorReady, setTutorReady] = useState(false)
    const [callStartTime, setCallStartTime] = useState<number | null>(null)

    // Incoming call state
    const [incomingCall, setIncomingCall] = useState<any>(null)
    const [showIncomingCallModal, setShowIncomingCallModal] = useState(false)

    // Initialize video call and get participant info
    useEffect(() => {
        // Get participant info from URL search params
        const urlParams = new URLSearchParams(window.location.search)
        const tutorIdParam = urlParams.get("tutorId")
        const tutorNameParam = urlParams.get("tutorName")
        const role = urlParams.get("role")
        const waitingParam = urlParams.get("waitingForTutor")

        console.log("🔍 Video call page initialization:")
        console.log(
            "- Auth user:",
            user?.firstName,
            user?.lastName,
            "ID:",
            user?.id,
            "Role:",
            user?.role
        )
        console.log(
            "- URL params - tutorId:",
            tutorIdParam,
            "tutorName:",
            tutorNameParam,
            "role:",
            role
        )

        if (tutorIdParam) {
            setOtherUserId(parseInt(tutorIdParam))
        }

        if (user?.role === "TUTOR") {
            // Extract student ID from session ID format: tutor_X_student_Y_timestamp
            const sessionParts = sessionId.split("_")
            if (sessionParts.length >= 4 && sessionParts[2] === "student") {
                const studentId = parseInt(sessionParts[3])
                setOtherUserId(studentId)
                setOtherUserName("Student")
            }
            setUserRole("tutor")

            // For tutors: Focus on student video (remote-video shows student)
            console.log(
                "🎯 Setting default focus for TUTOR: focusing on student video"
            )
        } else {
            if (tutorNameParam) {
                setOtherUserName(decodeURIComponent(tutorNameParam))
            } else {
                setOtherUserName("Tutor")
            }
            setUserRole("student")

            // For students: Focus on teacher video (remote-video shows teacher)
            console.log(
                "🎯 Setting default focus for STUDENT: focusing on teacher video"
            )
        }

        // Both roles start with video focus (remote-video is the other person)
        // This is already set in the initial state, so no need to change focus mode here

        // Initialize video call
        initializeVideoCall()

        return () => {
            cleanupConnection()
        }
    }, [sessionId, user])

    // Timeout mechanism - if student waits too long without response, assume call was declined
    useEffect(() => {
        if (user?.role === "STUDENT") {
            const timeoutId = setTimeout(() => {
                // If still waiting after 30 seconds and no call has been established
                if (
                    !isInCallRef.current &&
                    (callStatus === "Idle" || callStatus === "Calling...")
                ) {
                    console.log(
                        "⏰ Call timeout - assuming teacher declined or is unavailable"
                    )

                    toast.error("Teacher is not responding. Call timed out.", {
                        duration: 4000,
                    })

                    // Execute the same cleanup as call decline
                    const executeTimeoutCleanup = async () => {
                        try {
                            console.log(
                                "🚫 Cancelling session due to timeout..."
                            )
                            await api.put(
                                `/api/sessions/call/${sessionId}/cancel?reason=Call timeout - no response`
                            )
                            console.log("✅ Session cancelled due to timeout")
                        } catch (error) {
                            console.error(
                                "❌ Failed to cancel session on timeout:",
                                error
                            )
                        }

                        // Clean up and redirect
                        cleanupConnection()
                        console.log("🔙 Redirecting back due to timeout...")
                        router.back()
                    }

                    executeTimeoutCleanup()
                }
            }, 30000) // 30 second timeout

            return () => clearTimeout(timeoutId)
        }
    }, [user?.role, callStatus, sessionId, router])

    // Handle page unload/close - end call if user leaves
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isInCallRef.current) {
                // Show confirmation dialog before leaving during a call
                event.preventDefault()
                event.returnValue =
                    "You are currently in a video call. Are you sure you want to leave?"

                // Send disconnect message before page closes
                if (socketRef.current?.readyState === WebSocket.OPEN) {
                    socketRef.current.send(
                        JSON.stringify({
                            type: "user-disconnect",
                            userId: user?.id.toString(),
                            sessionId: sessionId,
                        })
                    )
                }
                return "You are currently in a video call. Are you sure you want to leave?"
            }
        }

        const handleVisibilityChange = () => {
            if (document.hidden && isInCallRef.current) {
                console.log(
                    " Page hidden during call, user may have switched tabs"
                )
                // Don't end call on visibility change - user might just switch tabs
                // Only end on actual page unload with confirmation
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        document.addEventListener("visibilitychange", handleVisibilityChange)

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            )
        }
    }, [user?.id, sessionId])

    // Debug: Check track states when stream changes
    useEffect(() => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0]
            const audioTrack = localStreamRef.current.getAudioTracks()[0]

            console.log("🔍 Current track states:")
            console.log(
                `📹 Video enabled: ${videoTrack?.enabled}, State: ${isVideoEnabled}`
            )
            console.log(
                `🎤 Audio enabled: ${audioTrack?.enabled}, State: ${isAudioEnabled}`
            )

            // Ensure tracks match our state
            if (videoTrack && videoTrack.enabled !== isVideoEnabled) {
                console.log(
                    `🔧 Fixing video track: setting to ${isVideoEnabled}`
                )
                videoTrack.enabled = isVideoEnabled
            }

            if (audioTrack && audioTrack.enabled !== isAudioEnabled) {
                console.log(
                    `🔧 Fixing audio track: setting to ${isAudioEnabled}`
                )
                audioTrack.enabled = isAudioEnabled
            }
        }
    }, [localStreamRef.current, isVideoEnabled, isAudioEnabled])

    const initializeVideoCall = async () => {
        try {
            setStatus("Setting up video call...")
            setCallStatus("Idle") // Ensure call status is Idle during initialization
            await setupLocalStream()
            await connectToSignalingServer()
        } catch (error) {
            console.error("Error initializing video call:", error)
            setStatus("Failed to initialize video call")
            setCallStatus("Idle")
        }
    }

    const setupLocalStream = async () => {
        try {
            setStatus("Accessing camera and microphone...")
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    frameRate: { ideal: 30, max: 60 },
                    facingMode: "user",
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            })

            localStreamRef.current = stream

            // Ensure tracks are enabled by default and match our state
            const videoTrack = stream.getVideoTracks()[0]
            const audioTrack = stream.getAudioTracks()[0]

            if (videoTrack) {
                videoTrack.enabled = isVideoEnabled // Should be true by default
                console.log(`📹 Video track enabled: ${videoTrack.enabled}`)
            }

            if (audioTrack) {
                audioTrack.enabled = isAudioEnabled // Should be true by default
                console.log(`🎤 Audio track enabled: ${audioTrack.enabled}`)
            }

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream
            }

            setStatus("Ready to call")
            // Ensure call status remains Idle after setup
            if (callStatus !== "Calling..." && callStatus !== "Connected") {
                setCallStatus("Idle")
            }
        } catch (error: any) {
            console.error("Error accessing media devices:", error)
            setStatus(`Media error: ${error.message}`)
        }
    }

    const connectToSignalingServer = async () => {
        try {
            const serverUrl =
                process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws") ||
                "ws://localhost:8080"
            const wsUrl = `${serverUrl}/ws/webrtc?userId=${user?.id}&sessionId=${sessionId}`

            socketRef.current = new WebSocket(wsUrl)

            socketRef.current.onopen = () => {
                setStatus("Connected")
                isConnectedRef.current = true

                // Wait a bit to ensure WebSocket is fully ready
                setTimeout(() => {
                    if (
                        socketRef.current &&
                        socketRef.current.readyState === WebSocket.OPEN
                    ) {
                        // Join the session and announce presence
                        socketRef.current.send(
                            JSON.stringify({
                                type: "join",
                                userId: user?.id.toString(),
                                sessionId: sessionId,
                                role: userRole,
                                userName: `${user?.firstName} ${user?.lastName}`,
                                timestamp: Date.now(),
                            })
                        )
                    }
                }, 500)
            }

            socketRef.current.onmessage = handleWebSocketMessage
            socketRef.current.onclose = () => {
                console.log(" WebSocket connection closed")
                setStatus("Disconnected")

                // Don't automatically end call on WebSocket close - user might be switching networks
                // Only cleanup connection without ending the session
                if (
                    isInCallRef.current &&
                    callStatus === "Connected" &&
                    !isEndingSessionRef.current
                ) {
                    console.log(
                        " WebSocket closed during call, attempting to reconnect..."
                    )
                    // Try to reconnect after a short delay
                    setTimeout(() => {
                        if (
                            isInCallRef.current &&
                            !isEndingSessionRef.current
                        ) {
                            console.log(
                                "🔄 Attempting to reconnect WebSocket..."
                            )
                            connectToSignalingServer()
                        }
                    }, 2000)
                } else {
                    cleanupConnection()
                }
            }
            socketRef.current.onerror = (error) => {
                console.error("WebSocket error:", error)
                setStatus("Connection error")
            }
        } catch (error: any) {
            setStatus(`Error: ${error.message}`)
        }
    }

    const cleanupConnection = () => {
        console.log("🧹 Starting cleanup - stopping all media streams...")

        // Stop all local stream tracks immediately
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                console.log(`🛑 Stopping ${track.kind} track`)
                track.stop()
            })
            localStreamRef.current = null
        }

        // Stop all screen stream tracks immediately
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((track) => {
                console.log(`🛑 Stopping screen ${track.kind} track`)
                track.stop()
            })
            screenStreamRef.current = null
        }

        // Clear video elements immediately
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null
        }

        // Close peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close()
            peerConnectionRef.current = null
        }

        // Close WebSocket connections
        if (socketRef.current) {
            socketRef.current.close()
            socketRef.current = null
        }
        if (whiteboardSocketRef.current) {
            whiteboardSocketRef.current.close()
            whiteboardSocketRef.current = null
        }

        // Reset all states immediately
        setIsVideoEnabled(false)
        setIsAudioEnabled(false)
        setIsScreenSharing(false)
        setCallStatus("Idle")
        setChatMessages([]) // Clear chat messages

        // Reset focus mode
        if (focusMode !== "none") {
            exitFocusMode()
        }

        isInCallRef.current = false

        // Update page title to indicate call ended
        if (typeof document !== "undefined") {
            document.title = "NerdsOnCall - Call Ended"
        }

        console.log("✅ Cleanup completed - all media streams stopped")
    }

    const handleWebSocketMessage = async (event: MessageEvent) => {
        try {
            const message = JSON.parse(event.data)
            console.log(
                "📨 Received WebSocket message:",
                message.type,
                "Full message:",
                message
            )

            switch (message.type) {
                case "incoming_call":
                    setIncomingCall({
                        callerId: message.from,
                        callerName: message.callerName,
                        sessionId: message.sessionId,
                    })
                    setShowIncomingCallModal(true)
                    break
                case "call_accepted":
                    setCallStatus("Calling...")
                    toast.success("Call accepted!")

                    // Start the session now that the tutor has accepted
                    if (!isSessionStartedRef.current) {
                        try {
                            isSessionStartedRef.current = true
                            await api.put(
                                `/api/sessions/call/${sessionId}/start`
                            )
                            console.log(
                                "✅ Session started successfully after tutor acceptance"
                            )
                        } catch (error: any) {
                            console.warn(
                                "Session start failed after tutor acceptance:",
                                error.message
                            )
                            isSessionStartedRef.current = false // Reset on error
                        }
                    } else {
                        console.log(
                            "Session already started, skipping tutor acceptance start"
                        )
                    }
                    break
                case "call_declined":
                    console.log(
                        "📞❌ Call declined by teacher - Full message:",
                        message
                    )

                    // Show toast notification IMMEDIATELY
                    toast.error("Teacher declined your call", {
                        duration: 4000,
                    })

                    setCallStatus("Call declined")

                    // Execute cleanup and redirect with guaranteed execution
                    const executeCallDeclineCleanup = async () => {
                        console.log(
                            "🚨 EXECUTING CALL DECLINE CLEANUP - GUARANTEED"
                        )

                        try {
                            // Cancel the session in backend to prevent billing
                            console.log(
                                "🚫 Cancelling session due to call decline..."
                            )
                            await api.put(
                                `/api/sessions/call/${sessionId}/cancel?reason=Call declined by teacher`
                            )
                            console.log("✅ Session cancelled successfully")
                        } catch (error) {
                            console.error("❌ Failed to cancel session:", error)
                            // Continue with cleanup even if cancel fails
                        }

                        // Reset call state - GUARANTEED
                        try {
                            if (peerConnectionRef.current) {
                                peerConnectionRef.current.close()
                                peerConnectionRef.current = null
                            }
                            isInCallRef.current = false

                            // Clean up local stream
                            if (localStreamRef.current) {
                                localStreamRef.current
                                    .getTracks()
                                    .forEach((track) => track.stop())
                                localStreamRef.current = null
                            }

                            // Clean up WebSocket connection
                            if (socketRef.current) {
                                socketRef.current.close()
                                socketRef.current = null
                            }
                        } catch (cleanupError) {
                            console.error(
                                "❌ Cleanup error (continuing anyway):",
                                cleanupError
                            )
                        }

                        // GUARANTEED REDIRECT - Multiple fallback methods
                        console.log(
                            "🔙 REDIRECTING BACK DUE TO CALL DECLINE - GUARANTEED"
                        )

                        // Add a small delay to ensure toast is shown before redirect
                        setTimeout(() => {
                            try {
                                // Method 1: router.back()
                                router.back()
                            } catch (routerError) {
                                console.error(
                                    "❌ router.back() failed, trying router.push:",
                                    routerError
                                )
                                try {
                                    // Method 2: router.push to browse-tutors
                                    router.push("/browse-tutors")
                                } catch (pushError) {
                                    console.error(
                                        "❌ router.push failed, trying window.history:",
                                        pushError
                                    )
                                    try {
                                        // Method 3: window.history.back()
                                        window.history.back()
                                    } catch (historyError) {
                                        console.error(
                                            "❌ window.history.back() failed, using window.location:",
                                            historyError
                                        )
                                        // Method 4: Direct navigation
                                        window.location.href = "/browse-tutors"
                                    }
                                }
                            }
                        }, 1000) // 1 second delay to ensure toast is visible
                    }

                    // Execute immediately with no delays
                    executeCallDeclineCleanup()
                    break
                case "offer":
                    await handleOffer(message)
                    break
                case "answer":
                    await handleAnswer(message)
                    break
                case "ice-candidate":
                    await handleIceCandidate(message)
                    break
                case "user-disconnect":
                    handleOtherUserEndCall()
                    break
                case "user-left":
                    console.log(" Other user left the call")
                    handleOtherUserEndCall()
                    break
                case "chat_message":
                    console.log("💬 Received chat message:", message.message)
                    const chatMessage = {
                        id: message.id || Date.now().toString(),
                        userId: parseInt(message.userId) || message.userId,
                        userName: message.userName,
                        message: message.message,
                        timestamp: new Date(message.timestamp || Date.now()),
                        type: "text",
                    }
                    setChatMessages((prev) => [...prev, chatMessage])
                    break
                case "user_typing":
                    console.log("⌨️ User typing:", message.userName)
                    // Typing indicators are handled by the ChatPanel component
                    break
                case "user-joined":
                    console.log(
                        "👋 User joined the session:",
                        message.userName || message.from
                    )
                    // Handle user joined event if needed
                    break
                default:
                    console.log("Unknown message type:", message.type)
            }
        } catch (error) {
            console.error("Error handling WebSocket message:", error)
        }
    }

    const sendChatMessage = (messageText: string) => {
        if (!socketRef.current || !user) {
            console.log("❌ Cannot send chat message: no socket or user")
            return
        }

        const message = {
            type: "chat_message",
            sessionId,
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            message: messageText,
            timestamp: new Date().toISOString(),
            id: Date.now().toString(),
        }

        console.log("📤 Sending chat message from main component:", message)
        socketRef.current.send(JSON.stringify(message))
    }

    // Focus mode functions
    const enterFocusMode = (mode: "video" | "whiteboard") => {
        if (focusMode === "none") {
            // Save current layouts
            setOriginalLayouts(layouts)
        }

        setFocusMode(mode)
        console.log(`🎯 Entering ${mode} focus mode`)

        // Create focus layouts with dynamic height calculation
        const focusedHeight = calculateFocusedHeight()
        // Use ALL available height for sidebar, give more to camera and chat
        const totalSidebarHeight = focusedHeight
        const cameraHeight = Math.floor(totalSidebarHeight * 0.4) // 40% for camera
        const chatHeight = Math.floor(totalSidebarHeight * 0.4) // 40% for chat
        const whiteboardHeight = totalSidebarHeight - cameraHeight - chatHeight // Remaining for whiteboard

        const focusLayouts = {
            lg:
                mode === "video"
                    ? [
                          {
                              i: "remote-video",
                              x: 0,
                              y: 0,
                              w: 9,
                              h: focusedHeight, // Dynamic height based on window
                              minW: 6,
                              minH: 6,
                          },
                          {
                              i: "local-video",
                              x: 9,
                              y: 0,
                              w: 3,
                              h: cameraHeight,
                              minW: 2,
                              minH: 2,
                          },
                          {
                              i: "chat",
                              x: 9,
                              y: cameraHeight,
                              w: 3,
                              h: chatHeight,
                              minW: 2,
                              minH: 3,
                          },
                          {
                              i: "whiteboard",
                              x: 9,
                              y: cameraHeight + chatHeight,
                              w: 3,
                              h: whiteboardHeight,
                              minW: 2,
                              minH: 2,
                          },
                      ]
                    : [
                          {
                              i: "whiteboard",
                              x: 0,
                              y: 0,
                              w: 9,
                              h: focusedHeight, // Dynamic height based on window
                              minW: 6,
                              minH: 6,
                          },
                          {
                              i: "remote-video",
                              x: 9,
                              y: 0,
                              w: 3,
                              h: cameraHeight,
                              minW: 2,
                              minH: 2,
                          },
                          {
                              i: "local-video",
                              x: 9,
                              y: cameraHeight,
                              w: 3,
                              h: chatHeight,
                              minW: 2,
                              minH: 2,
                          },
                          {
                              i: "chat",
                              x: 9,
                              y: cameraHeight + chatHeight,
                              w: 3,
                              h: whiteboardHeight,
                              minW: 2,
                              minH: 3,
                          },
                      ],
            md:
                mode === "video"
                    ? [
                          {
                              i: "remote-video",
                              x: 0,
                              y: 0,
                              w: 7,
                              h: 10,
                              minW: 5,
                              minH: 6,
                          },
                          {
                              i: "local-video",
                              x: 7,
                              y: 0,
                              w: 3,
                              h: 3,
                              minW: 2,
                              minH: 2,
                          },
                          {
                              i: "chat",
                              x: 7,
                              y: 3,
                              w: 3,
                              h: 4,
                              minW: 2,
                              minH: 3,
                          },
                          {
                              i: "whiteboard",
                              x: 7,
                              y: 7,
                              w: 3,
                              h: 3,
                              minW: 2,
                              minH: 2,
                          },
                      ]
                    : [
                          {
                              i: "whiteboard",
                              x: 0,
                              y: 0,
                              w: 7,
                              h: 10,
                              minW: 5,
                              minH: 6,
                          },
                          {
                              i: "remote-video",
                              x: 7,
                              y: 0,
                              w: 3,
                              h: 4,
                              minW: 2,
                              minH: 3,
                          },
                          {
                              i: "local-video",
                              x: 7,
                              y: 4,
                              w: 3,
                              h: 3,
                              minW: 2,
                              minH: 2,
                          },
                          {
                              i: "chat",
                              x: 7,
                              y: 7,
                              w: 3,
                              h: 3,
                              minW: 2,
                              minH: 2,
                          },
                      ],
            sm:
                mode === "video"
                    ? [
                          {
                              i: "remote-video",
                              x: 0,
                              y: 0,
                              w: 6,
                              h: 8,
                              minW: 4,
                              minH: 5,
                          },
                          {
                              i: "local-video",
                              x: 0,
                              y: 8,
                              w: 2,
                              h: 2,
                              minW: 1,
                              minH: 1,
                          },
                          {
                              i: "chat",
                              x: 2,
                              y: 8,
                              w: 2,
                              h: 3,
                              minW: 1,
                              minH: 2,
                          },
                          {
                              i: "whiteboard",
                              x: 4,
                              y: 8,
                              w: 2,
                              h: 3,
                              minW: 1,
                              minH: 2,
                          },
                      ]
                    : [
                          {
                              i: "whiteboard",
                              x: 0,
                              y: 0,
                              w: 6,
                              h: 8,
                              minW: 4,
                              minH: 5,
                          },
                          {
                              i: "remote-video",
                              x: 0,
                              y: 8,
                              w: 3,
                              h: 3,
                              minW: 2,
                              minH: 2,
                          },
                          {
                              i: "local-video",
                              x: 3,
                              y: 8,
                              w: 1,
                              h: 2,
                              minW: 1,
                              minH: 1,
                          },
                          {
                              i: "chat",
                              x: 4,
                              y: 8,
                              w: 2,
                              h: 3,
                              minW: 1,
                              minH: 2,
                          },
                      ],
            xs:
                mode === "video"
                    ? [
                          {
                              i: "remote-video",
                              x: 0,
                              y: 0,
                              w: 4,
                              h: 6,
                              minW: 3,
                              minH: 4,
                          },
                          {
                              i: "local-video",
                              x: 0,
                              y: 6,
                              w: 1,
                              h: 2,
                              minW: 1,
                              minH: 1,
                          },
                          {
                              i: "chat",
                              x: 1,
                              y: 6,
                              w: 1,
                              h: 2,
                              minW: 1,
                              minH: 1,
                          },
                          {
                              i: "whiteboard",
                              x: 2,
                              y: 6,
                              w: 2,
                              h: 2,
                              minW: 1,
                              minH: 1,
                          },
                      ]
                    : [
                          {
                              i: "whiteboard",
                              x: 0,
                              y: 0,
                              w: 4,
                              h: 6,
                              minW: 3,
                              minH: 4,
                          },
                          {
                              i: "remote-video",
                              x: 0,
                              y: 6,
                              w: 2,
                              h: 2,
                              minW: 1,
                              minH: 1,
                          },
                          {
                              i: "local-video",
                              x: 2,
                              y: 6,
                              w: 1,
                              h: 1,
                              minW: 1,
                              minH: 1,
                          },
                          {
                              i: "chat",
                              x: 3,
                              y: 6,
                              w: 1,
                              h: 2,
                              minW: 1,
                              minH: 1,
                          },
                      ],
            xxs:
                mode === "video"
                    ? [
                          {
                              i: "remote-video",
                              x: 0,
                              y: 0,
                              w: 2,
                              h: 5,
                              minW: 2,
                              minH: 3,
                          },
                          {
                              i: "local-video",
                              x: 0,
                              y: 5,
                              w: 1,
                              h: 1,
                              minW: 1,
                              minH: 1,
                          },
                          {
                              i: "chat",
                              x: 1,
                              y: 5,
                              w: 1,
                              h: 2,
                              minW: 1,
                              minH: 1,
                          },
                          {
                              i: "whiteboard",
                              x: 0,
                              y: 7,
                              w: 2,
                              h: 2,
                              minW: 1,
                              minH: 1,
                          },
                      ]
                    : [
                          {
                              i: "whiteboard",
                              x: 0,
                              y: 0,
                              w: 2,
                              h: 5,
                              minW: 2,
                              minH: 3,
                          },
                          {
                              i: "remote-video",
                              x: 0,
                              y: 5,
                              w: 2,
                              h: 2,
                              minW: 1,
                              minH: 1,
                          },
                          {
                              i: "local-video",
                              x: 0,
                              y: 7,
                              w: 1,
                              h: 1,
                              minW: 1,
                              minH: 1,
                          },
                          {
                              i: "chat",
                              x: 1,
                              y: 7,
                              w: 1,
                              h: 2,
                              minW: 1,
                              minH: 1,
                          },
                      ],
        }

        // Apply the new layouts
        setLayouts(focusLayouts)
        console.log(`✅ Applied ${mode} focus layout`)
    }

    const exitFocusMode = () => {
        console.log("🔄 Exiting focus mode")
        setFocusMode("none")
        if (originalLayouts) {
            setLayouts(originalLayouts)
            setOriginalLayouts(null)
            console.log("✅ Restored original layout")
        }
    }

    const createPeerConnection = () => {
        const configuration = {
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
            ],
        }

        peerConnectionRef.current = new RTCPeerConnection(configuration)

        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.send(
                    JSON.stringify({
                        type: "ice-candidate",
                        to: otherUserId.toString(),
                        from: user?.id.toString(),
                        sessionId: sessionId,
                        data: event.candidate,
                    })
                )
            }
        }

        peerConnectionRef.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0]
            }
            // Only set to Connected if we're actually in a call
            if (isInCallRef.current) {
                setCallStatus("Connected")

                // Start the session when call is actually connected to ensure actualStartTime is set
                const startSessionWhenConnected = async () => {
                    if (isSessionStartedRef.current) {
                        console.log("Session already started, skipping...")
                        return
                    }

                    try {
                        isSessionStartedRef.current = true
                        await api.put(`/api/sessions/call/${sessionId}/start`)
                        console.log("✅ Session started when call connected")
                    } catch (error: any) {
                        console.warn(
                            "Session start failed when call connected:",
                            error.message
                        )
                        isSessionStartedRef.current = false // Reset on error
                    }
                }
                startSessionWhenConnected()
            }
        }

        peerConnectionRef.current.onconnectionstatechange = () => {
            const state = peerConnectionRef.current?.connectionState
            console.log("Connection state:", state)

            // Handle connection failures - be less aggressive about ending calls
            if (state === "failed") {
                console.log(
                    " WebRTC connection failed, attempting to recover..."
                )

                // Only end call after multiple failed attempts and longer delay
                if (
                    isInCallRef.current &&
                    callStatus === "Connected" &&
                    !isEndingSessionRef.current
                ) {
                    setTimeout(() => {
                        // Double-check we're still in call and connection is still failed
                        if (
                            isInCallRef.current &&
                            !isEndingSessionRef.current &&
                            peerConnectionRef.current?.connectionState ===
                                "failed"
                        ) {
                            console.log(
                                "⚠️ WebRTC connection permanently failed, ending call..."
                            )
                            handleOtherUserEndCall()
                        }
                    }, 10000) // Give 10 seconds for recovery instead of 2
                }
            } else if (state === "disconnected") {
                console.log(
                    " WebRTC connection temporarily disconnected, waiting for recovery..."
                )
                // Don't end call on disconnected state - it often recovers automatically
            }
        }
    }

    const handleOffer = async (message: any) => {
        try {
            if (!peerConnectionRef.current) {
                createPeerConnection()

                if (localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach((track) => {
                        if (
                            peerConnectionRef.current &&
                            localStreamRef.current
                        ) {
                            // Ensure tracks are enabled when adding to peer connection
                            if (track.kind === "video") {
                                track.enabled = isVideoEnabled
                                console.log(
                                    `📹 Video track enabled for offer: ${track.enabled}`
                                )
                            } else if (track.kind === "audio") {
                                track.enabled = isAudioEnabled
                                console.log(
                                    `🎤 Audio track enabled for offer: ${track.enabled}`
                                )
                            }

                            peerConnectionRef.current.addTrack(
                                track,
                                localStreamRef.current
                            )
                        }
                    })
                }
            }

            await peerConnectionRef.current!.setRemoteDescription(
                new RTCSessionDescription(message.data)
            )
            const answer = await peerConnectionRef.current!.createAnswer()
            await peerConnectionRef.current!.setLocalDescription(answer)

            if (socketRef.current) {
                socketRef.current.send(
                    JSON.stringify({
                        type: "answer",
                        to: message.from,
                        from: user?.id.toString(),
                        sessionId: sessionId,
                        data: answer,
                    })
                )
            }
        } catch (error) {
            console.error("Error handling offer:", error)
        }
    }

    const handleAnswer = async (message: any) => {
        try {
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(
                    new RTCSessionDescription(message.data)
                )
            }
        } catch (error) {
            console.error("Error handling answer:", error)
        }
    }

    const handleIceCandidate = async (message: any) => {
        try {
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.addIceCandidate(
                    new RTCIceCandidate(message.data)
                )
            }
        } catch (error) {
            console.error("Error handling ICE candidate:", error)
        }
    }

    // Grid layout handlers
    const onLayoutChange = useCallback((layout: any, layouts: any) => {
        setLayouts(layouts)
    }, [])

    const onBreakpointChange = useCallback((breakpoint: string) => {
        console.log("Breakpoint changed:", breakpoint)
    }, [])

    // Toggle functions
    const toggleWhiteboard = useCallback(() => {
        setShowWhiteboard((prev) => !prev)
        toast(showWhiteboard ? "Whiteboard closed" : "Whiteboard opened")
    }, [showWhiteboard])

    const toggleAudio = useCallback(() => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !isAudioEnabled
                setIsAudioEnabled(!isAudioEnabled)
                toast(isAudioEnabled ? "Audio muted" : "Audio unmuted")
            }
        }
    }, [isAudioEnabled])

    const toggleVideo = useCallback(() => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0]
            if (videoTrack) {
                videoTrack.enabled = !isVideoEnabled
                setIsVideoEnabled(!isVideoEnabled)
                toast(isVideoEnabled ? "Video disabled" : "Video enabled")
            }
        }
    }, [isVideoEnabled])

    const toggleScreenShare = useCallback(async () => {
        try {
            if (!isScreenSharing) {
                const screenStream =
                    await navigator.mediaDevices.getDisplayMedia({
                        video: true,
                        audio: true,
                    })

                screenStreamRef.current = screenStream

                if (peerConnectionRef.current && localStreamRef.current) {
                    const videoTrack = screenStream.getVideoTracks()[0]
                    const sender = peerConnectionRef.current
                        .getSenders()
                        .find((s) => s.track && s.track.kind === "video")

                    if (sender) {
                        await sender.replaceTrack(videoTrack)
                    }
                }

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = screenStream
                }

                setIsScreenSharing(true)
                toast.success("Screen sharing started")

                screenStream.getVideoTracks()[0].onended = () => {
                    stopScreenShare()
                }
            } else {
                stopScreenShare()
            }
        } catch (error: any) {
            console.error("Error toggling screen share:", error)
            toast.error("Error with screen sharing")
        }
    }, [isScreenSharing])

    const stopScreenShare = async () => {
        try {
            if (screenStreamRef.current) {
                screenStreamRef.current
                    .getTracks()
                    .forEach((track) => track.stop())
                screenStreamRef.current = null
            }

            if (peerConnectionRef.current && localStreamRef.current) {
                const videoTrack = localStreamRef.current.getVideoTracks()[0]
                const sender = peerConnectionRef.current
                    .getSenders()
                    .find((s) => s.track && s.track.kind === "video")

                if (sender && videoTrack) {
                    await sender.replaceTrack(videoTrack)
                }
            }

            if (localVideoRef.current && localStreamRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current
            }

            setIsScreenSharing(false)
            toast("Screen sharing stopped")
        } catch (error: any) {
            console.error("Error stopping screen share:", error)
            toast.error("Error stopping screen share")
        }
    }

    const startCall = useCallback(async () => {
        try {
            setCallStatus("Calling...")

            // Create session in backend
            try {
                let parameterToPass
                if (user?.role === "STUDENT") {
                    parameterToPass = otherUserId
                } else if (user?.role === "TUTOR") {
                    parameterToPass = otherUserId
                } else {
                    throw new Error("Unknown user role: " + user?.role)
                }

                if (!parameterToPass || parameterToPass === 0) {
                    console.warn(
                        "⚠️ No valid other user ID found, skipping session creation"
                    )
                    return
                }

                const response = await api.post(
                    `/api/sessions/call?tutorId=${parameterToPass}&sessionId=${sessionId}`
                )
                console.log("✅ Session created successfully:", response.data)
            } catch (error: any) {
                console.warn(
                    "Session creation failed, continuing with call:",
                    error.message
                )
            }

            // NOTE: Session start is now moved to when tutor accepts the call
            // This prevents the session from being marked ACTIVE prematurely

            createPeerConnection()

            if (localStreamRef.current && peerConnectionRef.current) {
                localStreamRef.current.getTracks().forEach((track) => {
                    if (peerConnectionRef.current && localStreamRef.current) {
                        // Ensure tracks are enabled when adding to peer connection
                        if (track.kind === "video") {
                            track.enabled = isVideoEnabled
                            console.log(
                                `📹 Video track enabled for call: ${track.enabled}`
                            )
                        } else if (track.kind === "audio") {
                            track.enabled = isAudioEnabled
                            console.log(
                                `🎤 Audio track enabled for call: ${track.enabled}`
                            )
                        }

                        peerConnectionRef.current.addTrack(
                            track,
                            localStreamRef.current
                        )
                    }
                })
            }

            // Send incoming call notification to other user
            if (socketRef.current) {
                socketRef.current.send(
                    JSON.stringify({
                        type: "incoming_call",
                        to: otherUserId.toString(),
                        from: user?.id.toString(),
                        callerName: `${user?.firstName} ${user?.lastName}`,
                        callerId: user?.id,
                        sessionId: sessionId,
                        timestamp: Date.now(),
                    })
                )
            }

            // Create and send offer
            const offer = await peerConnectionRef.current!.createOffer()
            await peerConnectionRef.current!.setLocalDescription(offer)

            if (socketRef.current) {
                socketRef.current.send(
                    JSON.stringify({
                        type: "offer",
                        to: otherUserId.toString(),
                        from: user?.id.toString(),
                        sessionId: sessionId,
                        data: offer,
                    })
                )
            }

            isInCallRef.current = true
            toast.success("Call initiated!")
        } catch (error: any) {
            console.error("Error starting call:", error)
            setCallStatus("Idle")
            toast.error("Failed to start call")
        }
    }, [user, otherUserId, sessionId])

    const endCall = useCallback(async () => {
        try {
            // Confirm before ending call to prevent accidental clicks
            const confirmEnd = window.confirm(
                "Are you sure you want to end the call?"
            )
            if (!confirmEnd) {
                console.log("Call end cancelled by user")
                return
            }

            // Prevent duplicate session ending calls
            if (isEndingSessionRef.current) {
                console.log("Session already being ended, skipping...")
                return
            }
            isEndingSessionRef.current = true

            setCallStatus("Idle")
            isInCallRef.current = false

            // Immediately cleanup media streams to stop camera/mic indicators
            cleanupConnection()

            // End the session in the backend to calculate duration and earnings
            try {
                const response = await api.put(
                    `/api/sessions/call/${sessionId}/end`
                )
                console.log("✅ Session ended successfully:", response.data)

                if (
                    response.data.durationMinutes &&
                    response.data.tutorEarnings
                ) {
                    const duration = response.data.durationMinutes
                    const earnings = response.data.tutorEarnings
                    const cost = response.data.cost

                    toast.success(
                        `Session completed! Duration: ${duration} min, ${
                            user?.role === "TUTOR"
                                ? `Earnings: ₹${earnings.toFixed(2)}`
                                : `Cost: ₹${cost.toFixed(2)}`
                        }`,
                        { duration: 5000 }
                    )
                } else {
                    toast.success("Session ended successfully!")
                }
            } catch (error: any) {
                console.warn("Session end failed:", error)
                // Check if session was already ended
                if (
                    error.response?.status === 400 &&
                    error.response?.data?.includes("already completed")
                ) {
                    toast.success("Call ended")
                } else {
                    toast.success("Call ended")
                }
            }

            // Notify other user
            if (socketRef.current) {
                socketRef.current.send(
                    JSON.stringify({
                        type: "user-disconnect",
                        userId: user?.id.toString(),
                        sessionId: sessionId,
                    })
                )
            }

            // Reset session ending flag
            isEndingSessionRef.current = false

            // Navigate back after a delay
            setTimeout(() => {
                router.push("/dashboard")
            }, 1500) // Reduced delay for faster redirect
        } catch (error: any) {
            console.error("Error ending call:", error)
            toast.error("Error ending call")
            isEndingSessionRef.current = false // Reset flag on error
        }
    }, [user, sessionId, router])

    // Handle when the other user ends the call
    const handleOtherUserEndCall = useCallback(async () => {
        try {
            // Prevent duplicate session ending calls
            if (isEndingSessionRef.current) {
                console.log(
                    "Session already being ended, skipping other user end call..."
                )
                return
            }
            isEndingSessionRef.current = true

            console.log(" Other user ended the call - ending session")

            // Immediately update UI to show call has ended
            setCallStatus("Idle")
            isInCallRef.current = false

            // Immediately cleanup media streams to stop camera/mic indicators
            cleanupConnection()

            // Show immediate feedback to user
            toast("Other user ended the call", {
                duration: 2000,
                icon: "",
                style: {
                    background: "#3b82f6",
                    color: "white",
                },
            })

            // End the session in the backend to calculate duration and earnings
            // This ensures session data is recorded even when the other user ends the call
            try {
                const response = await api.put(
                    `/api/sessions/call/${sessionId}/end`
                )
                console.log(
                    "✅ Session ended successfully (other user initiated):",
                    response.data
                )

                if (
                    response.data.durationMinutes &&
                    response.data.tutorEarnings
                ) {
                    const duration = response.data.durationMinutes
                    const earnings = response.data.tutorEarnings
                    const cost = response.data.cost

                    toast.success(
                        `Session completed! Duration: ${duration} min, ${
                            user?.role === "TUTOR"
                                ? `Earnings: ₹${earnings.toFixed(2)}`
                                : `Cost: ₹${cost.toFixed(2)}`
                        }`,
                        { duration: 5000 }
                    )
                } else {
                    // Don't show duplicate message since we already showed one above
                    console.log("Session ended by other user")
                }
            } catch (error: any) {
                console.warn(
                    "Session end failed (other user initiated):",
                    error
                )
                // Don't show duplicate message since we already showed one above
                console.log(
                    "Session end API call failed, but call already ended in UI"
                )
            }

            // Reset session ending flag
            isEndingSessionRef.current = false

            // Navigate back after a delay
            setTimeout(() => {
                router.push("/dashboard")
            }, 1500) // Reduced delay for faster redirect
        } catch (error: any) {
            console.error("Error handling other user end call:", error)
            toast.error("Error ending call")
            isEndingSessionRef.current = false // Reset flag on error
        }
    }, [user, sessionId, router])

    const handleAcceptCall = useCallback(() => {
        setShowIncomingCallModal(false)
        setCallStatus("Calling...")

        if (socketRef.current && incomingCall) {
            socketRef.current.send(
                JSON.stringify({
                    type: "call_accepted",
                    to: incomingCall.callerId.toString(),
                    from: user?.id.toString(),
                    sessionId: incomingCall.sessionId,
                })
            )
        }

        toast.success("Call accepted")
    }, [incomingCall, user])

    const handleDeclineCall = useCallback(async () => {
        console.log("🚫 Declining call from:", incomingCall?.callerName)
        setShowIncomingCallModal(false)

        if (socketRef.current && incomingCall) {
            const declineMessage = {
                type: "call_declined",
                to: incomingCall.callerId.toString(),
                from: user?.id.toString(),
                sessionId: incomingCall.sessionId,
                declinerName: `${user?.firstName} ${user?.lastName}`,
            }

            console.log("📤 Sending call decline message:", declineMessage)
            socketRef.current.send(JSON.stringify(declineMessage))

            // Also cancel the session in backend
            try {
                console.log(
                    "🚫 Cancelling session due to call decline by teacher..."
                )
                await api.put(
                    `/api/sessions/call/${incomingCall.sessionId}/cancel?reason=Call declined by teacher`
                )
                console.log("✅ Session cancelled successfully")
            } catch (error) {
                console.error("❌ Failed to cancel session:", error)
            }
        }

        setIncomingCall(null)
        toast.error("Call declined")
    }, [incomingCall, user])

    if (!user) {
        return (
            <div className="min-h-screen bg-orange-100 flex items-center justify-center">
                <p className="text-black font-bold uppercase tracking-wide">
                    Please log in to join the video call.
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-orange-100 text-black relative overflow-hidden">
            {/* Grid Layout Container */}
            <div className="h-[calc(100vh-4rem)] p-3 pb-3 overflow-hidden">
                <ResponsiveGridLayout
                    className="layout"
                    layouts={layouts}
                    onLayoutChange={onLayoutChange}
                    onBreakpointChange={onBreakpointChange}
                    breakpoints={{
                        lg: 1200,
                        md: 996,
                        sm: 768,
                        xs: 480,
                        xxs: 0,
                    }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    rowHeight={50}
                    compactType={null}
                    preventCollision={true}
                    isDraggable={true}
                    isResizable={true}
                    draggableHandle=".react-grid-draghandle"
                    margin={[12, 12]}
                    containerPadding={[8, 8]}
                >
                    {/* Remote Video Card */}
                    <div
                        key="remote-video"
                        className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] overflow-hidden w-full h-full"
                    >
                        <div className="h-full flex flex-col">
                            <div className="bg-black text-white p-2 flex items-center justify-between border-b-4 border-black react-grid-draghandle cursor-move">
                                <div className="flex items-center space-x-2">
                                    <Users className="h-4 w-4" />
                                    <span className="font-black uppercase tracking-wide text-sm">
                                        {otherUserName || "Remote User"}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {focusMode === "video" ? (
                                        <Button
                                            onClick={exitFocusMode}
                                            className="px-2 py-1 text-xs bg-yellow-400 hover:bg-yellow-500 text-black border-2 border-white font-black uppercase tracking-wide"
                                            title="Exit Focus Mode"
                                        >
                                            EXIT
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() =>
                                                enterFocusMode("video")
                                            }
                                            className="px-2 py-1 text-xs bg-blue-400 hover:bg-blue-500 text-black border-2 border-white font-black uppercase tracking-wide"
                                            title="Focus on Video"
                                        >
                                            FOCUS
                                        </Button>
                                    )}
                                    <div
                                        className={`px-2 py-1 text-xs font-black uppercase tracking-wide border-2 border-white ${
                                            callStatus === "Connected"
                                                ? "bg-green-400 text-black"
                                                : "bg-red-400 text-black"
                                        }`}
                                    >
                                        {callStatus}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 relative bg-black overflow-hidden">
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                    style={{ minHeight: "200px" }}
                                />
                                {callStatus !== "Connected" && (
                                    <div className="absolute inset-0 bg-cyan-100 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-black border-3 border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center mx-auto mb-4">
                                                <span className="text-2xl font-black text-white">
                                                    {otherUserName?.charAt(0) ||
                                                        "U"}
                                                </span>
                                            </div>
                                            <p className="text-lg text-black font-black uppercase tracking-wide">
                                                {callStatus === "Idle"
                                                    ? "Click Start Call to begin"
                                                    : callStatus ===
                                                      "Calling..."
                                                    ? "Connecting..."
                                                    : callStatus === "Connected"
                                                    ? "Call in progress"
                                                    : callStatus}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Local Video Card */}
                    <div
                        key="local-video"
                        className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] overflow-hidden w-full h-full"
                    >
                        <div className="h-full flex flex-col">
                            <div className="bg-pink-300 text-black p-2 flex items-center justify-between border-b-4 border-black">
                                <div className="flex items-center space-x-2">
                                    <Video className="h-4 w-4" />
                                    <span className="font-black uppercase tracking-wide text-sm">
                                        You ({user?.firstName})
                                    </span>
                                </div>
                                <div
                                    className={`px-2 py-1 text-xs font-black uppercase tracking-wide border-2 border-black ${
                                        isVideoEnabled
                                            ? "bg-green-300 text-black"
                                            : "bg-red-300 text-black"
                                    }`}
                                >
                                    {isVideoEnabled ? "Video On" : "Video Off"}
                                </div>
                            </div>
                            <div className="flex-1 relative bg-black overflow-hidden">
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover scale-x-[-1]"
                                    style={{ minHeight: "150px" }}
                                />
                                {!isVideoEnabled && (
                                    <div className="absolute inset-0 bg-pink-100 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-black border-3 border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center mx-auto mb-4">
                                                <span className="text-2xl font-black text-white">
                                                    {user?.firstName?.charAt(
                                                        0
                                                    ) || "Y"}
                                                </span>
                                            </div>
                                            <p className="text-lg text-black font-black uppercase tracking-wide">
                                                Video Disabled
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Whiteboard Card */}
                    <div
                        key="whiteboard"
                        className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] overflow-hidden w-full h-full"
                    >
                        <div className="h-full flex flex-col">
                            <div className="bg-green-300 text-black p-2 flex items-center justify-between border-b-4 border-black react-grid-draghandle cursor-move">
                                <div className="flex items-center space-x-2">
                                    <PenTool className="h-4 w-4" />
                                    <span className="font-black uppercase tracking-wide text-sm">
                                        Collaborative Whiteboard
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {focusMode === "whiteboard" ? (
                                        <Button
                                            onClick={exitFocusMode}
                                            className="px-2 py-1 text-xs bg-yellow-400 hover:bg-yellow-500 text-black border-2 border-black font-black uppercase tracking-wide"
                                            title="Exit Focus Mode"
                                        >
                                            EXIT
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() =>
                                                enterFocusMode("whiteboard")
                                            }
                                            className="px-2 py-1 text-xs bg-purple-400 hover:bg-purple-500 text-black border-2 border-black font-black uppercase tracking-wide"
                                            title="Focus on Whiteboard"
                                        >
                                            FOCUS
                                        </Button>
                                    )}
                                    <Button
                                        onClick={toggleWhiteboard}
                                        className={`px-2 py-1 text-xs border-2 border-black font-black uppercase tracking-wide ${
                                            showWhiteboard
                                                ? "bg-red-300 hover:bg-red-400 text-black"
                                                : "bg-blue-300 hover:bg-blue-400 text-black"
                                        }`}
                                    >
                                        {showWhiteboard ? "Close" : "Open"}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 relative react-grid-no-drag">
                                {showWhiteboard ? (
                                    <Canvas
                                        sessionId={sessionId}
                                        user={user}
                                        socket={socketRef.current}
                                        onCanvasUpdate={(data) => {
                                            console.log("Canvas updated:", data)
                                        }}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-green-100">
                                        <div className="text-center">
                                            <PenTool className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                                            <p className="text-black font-black uppercase tracking-wide">
                                                Click &quot;Open&quot; to start
                                                whiteboard
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chat Card */}
                    <div
                        key="chat"
                        className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] overflow-hidden w-full h-full"
                    >
                        <div className="h-full flex flex-col">
                            <div className="bg-yellow-300 text-black p-2 flex items-center justify-between border-b-4 border-black react-grid-draghandle cursor-move">
                                <div className="flex items-center space-x-2">
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="font-black uppercase tracking-wide text-sm">
                                        Chat
                                    </span>
                                </div>
                                <Button
                                    onClick={() => setShowChat(!showChat)}
                                    className={`px-2 py-1 text-xs border-2 border-black font-black uppercase tracking-wide ${
                                        showChat
                                            ? "bg-red-300 hover:bg-red-400 text-black"
                                            : "bg-blue-300 hover:bg-blue-400 text-black"
                                    }`}
                                >
                                    {showChat ? "Close" : "Open"}
                                </Button>
                            </div>
                            <div className="flex-1">
                                {showChat ? (
                                    <ChatPanel
                                        sessionId={sessionId}
                                        isOpen={showChat}
                                        onClose={() => setShowChat(false)}
                                        socket={socketRef.current}
                                        user={user}
                                        messages={chatMessages}
                                        onSendMessage={sendChatMessage}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-yellow-100">
                                        <div className="text-center">
                                            <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                                            <p className="text-black font-black uppercase tracking-wide">
                                                Click &quot;Open&quot; to start
                                                chat
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ResponsiveGridLayout>
            </div>

            {/* Fixed Always-Visible Controls Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-black border-t-4 border-black shadow-[0px_-8px_0px_0px_black] z-50">
                <div className="flex items-center justify-center p-3 space-x-3">
                    {/* Audio Toggle */}
                    <Button
                        onClick={toggleAudio}
                        className={`p-2 border-2 border-white shadow-[3px_3px_0px_0px_white] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_white] transition-all font-black ${
                            isAudioEnabled
                                ? "bg-green-400 hover:bg-green-500 text-black"
                                : "bg-red-400 hover:bg-red-500 text-black"
                        }`}
                        title={isAudioEnabled ? "Mute Audio" : "Unmute Audio"}
                    >
                        {isAudioEnabled ? (
                            <Mic className="h-4 w-4" />
                        ) : (
                            <MicOff className="h-4 w-4" />
                        )}
                    </Button>

                    {/* Video Toggle */}
                    <Button
                        onClick={toggleVideo}
                        className={`p-2 border-2 border-white shadow-[3px_3px_0px_0px_white] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_white] transition-all font-black ${
                            isVideoEnabled
                                ? "bg-green-400 hover:bg-green-500 text-black"
                                : "bg-red-400 hover:bg-red-500 text-black"
                        }`}
                        title={
                            isVideoEnabled ? "Turn Off Video" : "Turn On Video"
                        }
                    >
                        {isVideoEnabled ? (
                            <Video className="h-4 w-4" />
                        ) : (
                            <VideoOff className="h-4 w-4" />
                        )}
                    </Button>

                    {/* Screen Share Toggle */}
                    <Button
                        onClick={toggleScreenShare}
                        className={`p-2 border-2 border-white shadow-[3px_3px_0px_0px_white] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_white] transition-all font-black ${
                            isScreenSharing
                                ? "bg-blue-400 hover:bg-blue-500 text-black"
                                : "bg-gray-400 hover:bg-gray-500 text-black"
                        }`}
                        title={
                            isScreenSharing
                                ? "Stop Screen Share"
                                : "Share Screen"
                        }
                    >
                        {isScreenSharing ? (
                            <MonitorOff className="h-4 w-4" />
                        ) : (
                            <Monitor className="h-4 w-4" />
                        )}
                    </Button>

                    {/* Whiteboard Toggle */}
                    <Button
                        onClick={toggleWhiteboard}
                        className={`p-2 border-2 border-white shadow-[3px_3px_0px_0px_white] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_white] transition-all font-black ${
                            showWhiteboard
                                ? "bg-green-400 hover:bg-green-500 text-black"
                                : "bg-gray-400 hover:bg-gray-500 text-black"
                        }`}
                        title={
                            showWhiteboard
                                ? "Close Whiteboard"
                                : "Open Whiteboard"
                        }
                    >
                        <PenTool className="h-4 w-4" />
                    </Button>

                    {/* Chat Toggle */}
                    <Button
                        onClick={() => setShowChat(!showChat)}
                        className={`p-2 border-2 border-white shadow-[3px_3px_0px_0px_white] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_white] transition-all font-black ${
                            showChat
                                ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                                : "bg-gray-400 hover:bg-gray-500 text-black"
                        }`}
                        title={showChat ? "Close Chat" : "Open Chat"}
                    >
                        <MessageSquare className="h-4 w-4" />
                    </Button>

                    {/* Focus Mode Indicator */}
                    {focusMode !== "none" && (
                        <div className="px-3 py-1 bg-yellow-400 text-black border-2 border-white font-black uppercase tracking-wide text-xs">
                            {focusMode} FOCUS
                        </div>
                    )}

                    {/* Start/End Call */}
                    {callStatus === "Idle" ? (
                        <Button
                            onClick={startCall}
                            className="p-3 bg-green-500 hover:bg-green-600 text-white border-2 border-white shadow-[3px_3px_0px_0px_white] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_white] transition-all font-black"
                            title="Start Call"
                        >
                            <Phone className="h-5 w-5" />
                        </Button>
                    ) : (
                        <Button
                            onClick={endCall}
                            className="p-3 bg-red-500 hover:bg-red-600 text-white border-2 border-white shadow-[3px_3px_0px_0px_white] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_white] transition-all font-black"
                            title="End Call"
                        >
                            <PhoneOff className="h-5 w-5" />
                        </Button>
                    )}

                    {/* Call Status */}
                    <div className="px-3 py-1 bg-white text-black border-2 border-white shadow-[3px_3px_0px_0px_white] font-black uppercase tracking-wide text-xs">
                        {callStatus === "Idle" ? "Ready" : callStatus}
                    </div>
                </div>
            </div>

            {/* Incoming Call Notification */}
            {incomingCall && (
                <IncomingCallNotification
                    isOpen={showIncomingCallModal}
                    onAccept={handleAcceptCall}
                    onDecline={handleDeclineCall}
                    callerName={incomingCall.callerName}
                    callerId={incomingCall.callerId}
                    sessionId={incomingCall.sessionId}
                    callerRole="TUTOR"
                />
            )}
        </div>
    )
}
