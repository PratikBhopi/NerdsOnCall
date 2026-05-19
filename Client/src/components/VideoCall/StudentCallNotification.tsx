"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useWebSocket } from "@/context/WebSocketContext"
import { useRouter } from "next/navigation"
import { IncomingCallModal } from "./IncomingCallModal"
import toast from "react-hot-toast"

interface StudentCallNotificationProps {
    // This component doesn't need any props - it's a global listener
}

export function StudentCallNotification({}: StudentCallNotificationProps) {
    const { user } = useAuth()
    const {} = useWebSocket()
    const router = useRouter()

    // State for incoming call handling
    const [incomingCall, setIncomingCall] = useState<{
        callerId: string
        callerName: string
        sessionId: string
    } | null>(null)
    const [showIncomingCallModal, setShowIncomingCallModal] = useState(false)

    // Note: This component is temporarily disabled as WebSocket doubt notifications have been removed
    // Video calling functionality is preserved through other mechanisms
    useEffect(() => {
        // Component functionality disabled - WebSocket doubt notifications removed
        console.log(
            "StudentCallNotification: Component disabled - WebSocket doubt notifications removed"
        )
    }, [user, router])

    // Disabled handlers - preserving structure for future video calling implementation
    const handleAcceptIncomingCall = () => {
        console.log("StudentCallNotification: Component disabled")
    }

    const handleDeclineIncomingCall = () => {
        console.log("StudentCallNotification: Component disabled")
    }

    if (!user || user.role !== "STUDENT") {
        return null
    }

    // Return minimal structure to preserve component interface
    return (
        <>
            {/* Component disabled - WebSocket doubt notifications removed */}
            {false && incomingCall && (
                <IncomingCallModal
                    isOpen={showIncomingCallModal}
                    callerName={incomingCall?.callerName || ""}
                    callerId={incomingCall?.callerId || ""}
                    sessionId={incomingCall?.sessionId || ""}
                    onAccept={handleAcceptIncomingCall}
                    onDecline={handleDeclineIncomingCall}
                />
            )}
        </>
    )
}
