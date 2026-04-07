"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/context/AuthContext"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import toast from "react-hot-toast"
import { Phone, PhoneOff, User } from "lucide-react"
import { VideoCallModal } from "./VideoCallModal"

interface TutorCallNotificationProps {
    onCallReceived?: (studentId: number, studentName: string) => void
}

export function TutorCallNotification({
    onCallReceived,
}: TutorCallNotificationProps) {
    const { user } = useAuth()
    const [isConnected, setIsConnected] = useState(false)
    const [incomingCall, setIncomingCall] = useState<{
        studentId: number
        studentName: string
        sessionId: string
    } | null>(null)
    const [isCallModalOpen, setIsCallModalOpen] = useState(false)
    const [logs, setLogs] = useState<string[]>([])
    const [isInCall, setIsInCall] = useState(false) // Track if tutor is currently in a call

    const socketRef = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Add a log entry
    const addLog = (message: string) => {
        console.log(message)
        setLogs((prev) => [
            ...prev,
            `${new Date().toLocaleTimeString()} - ${message}`,
        ])
    }

    // Test API connectivity
    const testApiConnectivity = async () => {
        try {
            if (!process.env.NEXT_PUBLIC_API_URL) {
                addLog("API URL not configured")
                return false
            }

            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/health`,
                {
                    method: "GET",
                    signal: controller.signal,
                }
            )

            clearTimeout(timeoutId)

            if (response.ok) {
                addLog("API server is reachable")
                return true
            } else {
                addLog(`API server responded with status: ${response.status}`)
                return false
            }
        } catch (error: any) {
            if (error.name === "AbortError") {
                addLog("API connectivity test timed out")
            } else if (error.message.includes("Failed to fetch")) {
                addLog("Cannot reach API server - check if server is running")
            } else {
                addLog(`API connectivity test failed: ${error.message}`)
            }
            return false
        }
    }

    // Connect to the signaling server when component mounts
    useEffect(() => {
        if (user?.role === "TUTOR") {
            // Test API connectivity first, then connect to WebSocket
            testApiConnectivity().then((isConnected) => {
                if (isConnected) {
                    connectToSignalingServer()
                } else {
                    addLog(
                        "Skipping WebSocket connection due to API connectivity issues"
                    )
                }
            })
        }

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
            disconnectFromSignalingServer()
        }
    }, [user])

    // Connect to the signaling server
    const connectToSignalingServer = () => {
        try {
            if (!user || user.role !== "TUTOR") return

            // Check if API URL is configured
            if (!process.env.NEXT_PUBLIC_API_URL) {
                addLog("Error: NEXT_PUBLIC_API_URL is not configured")
                return
            }

            // Clear any existing reconnection timeout
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
                reconnectTimeoutRef.current = null
            }

            // Connect to WebSocket
            const serverUrl = process.env.NEXT_PUBLIC_API_URL.replace(
                "http",
                "ws"
            )
            const wsUrl = `${serverUrl}/ws/webrtc?userId=${user.id}`

            addLog(`Connecting to ${wsUrl}`)

            socketRef.current = new WebSocket(wsUrl)

            socketRef.current.onopen = () => {
                addLog("WebSocket connection established")
                setIsConnected(true)

                // Note: Online status is now managed manually by tutors via dashboard toggle
                // No automatic status updates on WebSocket connection
            }

            socketRef.current.onmessage = handleWebSocketMessage

            socketRef.current.onclose = (event) => {
                addLog(
                    `WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`
                )
                setIsConnected(false)

                // Note: Online status is now managed manually by tutors via dashboard toggle
                // No automatic status updates on WebSocket disconnect

                // Only reconnect if it wasn't a manual close
                if (event.code !== 1000) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        addLog("Attempting to reconnect...")
                        connectToSignalingServer()
                    }, 5000)
                }
            }

            socketRef.current.onerror = (error) => {
                addLog(`WebSocket error: ${error}`)
                setIsConnected(false)
            }
        } catch (error: any) {
            addLog(`Error: ${error.message}`)
        }
    }

    // Disconnect from the signaling server
    const disconnectFromSignalingServer = () => {
        if (
            socketRef.current &&
            socketRef.current.readyState === WebSocket.OPEN
        ) {
            socketRef.current.close(1000, "Component unmounting")
        }
        socketRef.current = null
        setIsConnected(false)

        // Note: Online status is now managed manually by tutors via dashboard toggle
        // No automatic status updates on component unmount
    }

    // Note: Online status management has been moved to dashboard manual toggle
    // The updateOnlineStatus function is no longer needed here

    // Handle WebSocket messages
    const handleWebSocketMessage = (event: MessageEvent) => {
        try {
            const message = JSON.parse(event.data)
            addLog(`Received message: ${message.type}`)

            switch (message.type) {
                case "incoming_call":
                    handleIncomingCallNotification(message)
                    break
                case "offer":
                    handleIncomingCall(message)
                    break
                case "user-joined":
                    addLog(`User ${message.userId} joined the session`)
                    break
                case "user-left":
                    addLog(`User ${message.userId} left the session`)
                    break
                case "participants-list":
                    addLog(
                        `Participants in session: ${JSON.stringify(
                            message.participants
                        )}`
                    )
                    break
                case "error":
                    addLog(`Error from server: ${message.message}`)
                    break
            }
        } catch (error: any) {
            addLog(`Error parsing message: ${error.message}`)
        }
    }

    // Handle incoming call notification (before WebRTC offer)
    const handleIncomingCallNotification = async (message: any) => {
        try {
            addLog(`Incoming call notification from student ${message.from}`)

            // Check if tutor is already in a call
            if (isInCall) {
                addLog(
                    `Tutor is busy, rejecting call from student ${message.from}`
                )

                // Send busy response back to student
                if (
                    socketRef.current &&
                    socketRef.current.readyState === WebSocket.OPEN
                ) {
                    socketRef.current.send(
                        JSON.stringify({
                            type: "tutor_busy",
                            to: message.from,
                            from: user?.id.toString(),
                            sessionId: message.sessionId,
                            tutorName: `${user?.firstName} ${user?.lastName}`,
                            message: "Tutor is currently in another call",
                        })
                    )
                }
                return
            }

            const studentId = parseInt(message.from || message.callerId)
            const sessionId = message.sessionId
            const studentName = message.callerName

            if (!studentId || !sessionId || !studentName) {
                addLog("Missing required call information")
                return
            }

            // Set incoming call data
            setIncomingCall({
                studentId,
                studentName,
                sessionId,
            })

            // Show toast notification
            toast(` Incoming call from ${studentName}`, {
                duration: 30000,
                icon: "",
                style: {
                    background: "#fff",
                    color: "#000",
                    border: "2px solid #10b981",
                    fontWeight: "bold",
                },
            })

            // Optional callback
            if (onCallReceived) {
                onCallReceived(studentId, studentName)
            }
        } catch (error: any) {
            addLog(
                `Error handling incoming call notification: ${error.message}`
            )
        }
    }

    // Handle incoming call
    const handleIncomingCall = async (message: any) => {
        try {
            // Extract student information from the message
            const studentId = parseInt(message.from)
            const sessionId = message.sessionId

            console.log(studentId)
            console.log(sessionId)

            // Check if API URL is available
            if (!process.env.NEXT_PUBLIC_API_URL) {
                addLog("API URL not configured, using fallback student name")
                // Use fallback data
                setIncomingCall({
                    studentId,
                    studentName: `Student ${studentId}`,
                    sessionId,
                })
                return
            }

            const token = localStorage.getItem("token")
            if (!token) {
                addLog("No auth token, using fallback student name")
                // Use fallback data
                setIncomingCall({
                    studentId,
                    studentName: `Student ${studentId}`,
                    sessionId,
                })
                return
            }

            // Fetch student details with timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/users/${studentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                }
            )

            clearTimeout(timeoutId)

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: Failed to fetch student details`
                )
            }

            const studentData = await response.json()
            const studentName = `${studentData.firstName} ${studentData.lastName}`

            // Set incoming call data
            setIncomingCall({
                studentId,
                studentName,
                sessionId,
            })

            // Notify with a toast
            toast(`Incoming call from ${studentName}`, {
                duration: 10000,
                icon: "",
            })

            // Optional callback
            if (onCallReceived) {
                onCallReceived(studentId, studentName)
            }
        } catch (error: any) {
            addLog(`Error handling incoming call: ${error.message}`)

            // Fallback: still show the call with generic student name
            const studentId = parseInt(message.from)
            const sessionId = message.sessionId

            if (studentId && sessionId) {
                setIncomingCall({
                    studentId,
                    studentName: `Student ${studentId}`,
                    sessionId,
                })

                toast(`Incoming call from Student ${studentId}`, {
                    duration: 10000,
                    icon: "",
                })

                if (onCallReceived) {
                    onCallReceived(studentId, `Student ${studentId}`)
                }
            }
        }
    }

    // Accept the call
    const acceptCall = () => {
        if (incomingCall) {
            setIsInCall(true) // Mark tutor as busy
            setIsCallModalOpen(true)
            addLog(
                `Accepted call from ${incomingCall.studentName} - Tutor is now busy`
            )
        }
    }

    // Reject the call
    const rejectCall = () => {
        if (incomingCall && socketRef.current) {
            addLog(
                `Rejecting call from student ${incomingCall.studentName} (ID: ${incomingCall.studentId})`
            )

            // Send rejection message with correct type
            const declineMessage = {
                type: "call_declined",
                to: incomingCall.studentId.toString(),
                from: user?.id.toString(),
                sessionId: incomingCall.sessionId,
                declinerName: `${user?.firstName} ${user?.lastName}`,
            }

            try {
                socketRef.current.send(JSON.stringify(declineMessage))
                addLog("Call decline message sent successfully")

                // Also cancel the session in backend to prevent billing
                api.put(
                    `/api/sessions/call/${incomingCall.sessionId}/cancel?reason=Call declined by tutor`
                )
                    .then(() => {
                        addLog("Session cancelled successfully in backend")
                    })
                    .catch((error) => {
                        addLog(`Failed to cancel session: ${error.message}`)
                    })
            } catch (error) {
                addLog(`Failed to send decline message: ${error}`)
            }

            // Clear incoming call
            setIncomingCall(null)
        }
    }

    // Handle call ended
    const handleCallEnded = () => {
        setIsCallModalOpen(false)
        setIncomingCall(null)
        setIsInCall(false) // Mark tutor as available again
        addLog("Call ended - Tutor is now available")
    }

    if (!user || user.role !== "TUTOR") {
        return null
    }

    return (
        <>
            {/* Incoming Call Dialog */}
            <Dialog
                open={!!incomingCall && !isCallModalOpen}
                onOpenChange={(open) => {
                    if (!open) rejectCall()
                }}
            >
                <DialogContent className="sm:max-w-md bg-yellow-100 border-4 border-black shadow-[8px_8px_0px_0px_black]">
                    <DialogHeader className="bg-yellow-300 text-black p-4 -m-6 mb-6 border-b-4 border-black">
                        <DialogTitle className="text-black text-xl font-black text-center uppercase tracking-wide flex items-center justify-center">
                            <Phone className="h-6 w-6 mr-2" />
                            Incoming Call
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center py-6 bg-yellow-50">
                        <div className="w-20 h-20 bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_black] rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <User className="h-10 w-10 text-black" />
                        </div>

                        <div className="text-center mb-6">
                            <p className="text-lg font-black text-black mb-2 truncate max-w-xs">
                                {incomingCall?.studentName}
                            </p>
                            <p className="text-xs text-black bg-white px-4 py-2 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_black] font-bold">
                                Student requesting help
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center space-x-4 bg-yellow-200 pt-4 pb-6 border-t-4 border-black">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={rejectCall}
                            className="min-w-[120px] h-12 bg-red-400 hover:bg-red-500 text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all duration-200 flex items-center justify-center"
                        >
                            <PhoneOff className="mr-2 h-4 w-4" />
                            DECLINE
                        </Button>
                        <Button
                            type="button"
                            onClick={acceptCall}
                            className="min-w-[120px] h-12 bg-green-400 hover:bg-green-500 text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all duration-200 animate-pulse flex items-center justify-center"
                        >
                            <Phone className="mr-2 h-4 w-4" />
                            ACCEPT
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Video Call Modal */}
            {incomingCall && isCallModalOpen && (
                <VideoCallModal
                    isOpen={isCallModalOpen}
                    onClose={handleCallEnded}
                    tutorId={incomingCall.studentId}
                    tutorName={incomingCall.studentName}
                    sessionId={incomingCall.sessionId}
                    isIncomingCall={true}
                    existingSocket={socketRef.current}
                />
            )}

            {/* Tutor Status Indicator */}
            {isInCall && (
                <div className="fixed top-20 right-4 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg z-50">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">
                            In Call - Busy
                        </span>
                    </div>
                </div>
            )}

            {/* Connection Status Indicator (can be shown in the UI if needed) */}
            <div className="hidden">
                Connection Status: {isConnected ? "Connected" : "Disconnected"}
                <div className="text-xs">
                    {logs.slice(-5).map((log, index) => (
                        <div key={index}>{log}</div>
                    ))}
                </div>
            </div>
        </>
    )
}
