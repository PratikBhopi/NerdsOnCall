"use client"

import { ReactNode, useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { TutorCallNotification } from "@/components/VideoCall/TutorCallNotification"
import { IncomingCallNotification } from "@/components/VideoCall/IncomingCallNotification"
import { StudentCallNotification } from "@/components/VideoCall/StudentCallNotification"

interface TutorCallProviderProps {
    children: ReactNode
}

export function TutorCallProvider({ children }: TutorCallProviderProps) {
    const { user } = useAuth()
    const [incomingCall, setIncomingCall] = useState<{
        isOpen: boolean
        callerName: string
        callerId: number
        sessionId: string
    }>({
        isOpen: false,
        callerName: "",
        callerId: 0,
        sessionId: "",
    })

    // Incoming calls use /ws/webrtc via TutorCallNotification (server has no /ws/calls endpoint)

    const handleAcceptCall = () => {
        setIncomingCall((prev) => ({ ...prev, isOpen: false }))
        // The IncomingCallNotification component handles navigation
    }

    const handleDeclineCall = () => {
        setIncomingCall((prev) => ({ ...prev, isOpen: false }))
        // Could send decline message to caller here
    }

    return (
        <>
            {children}
            {/* Render notification components based on user role */}
            {user?.role === "TUTOR" && (
                <>
                    <TutorCallNotification />
                    <IncomingCallNotification
                        isOpen={incomingCall.isOpen}
                        onAccept={handleAcceptCall}
                        onDecline={handleDeclineCall}
                        callerName={incomingCall.callerName}
                        callerId={incomingCall.callerId}
                        sessionId={incomingCall.sessionId}
                    />
                </>
            )}
            
            {/* Global call notification for students */}
            {user?.role === "STUDENT" && (
                <StudentCallNotification />
            )}
        </>
    )
}
