"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"
import { 
    Video, 
    Users, 
    Clock,
    CheckCircle,
    Loader2,
    Lightbulb
} from "lucide-react"

interface CallInitiationModalProps {
    isOpen: boolean
    onClose: () => void
    doubt?: any
    otherUserName: string
    otherUserRole: 'STUDENT' | 'TUTOR'
    onStartCall: () => void
}

export function CallInitiationModal({
    isOpen,
    onClose,
    doubt,
    otherUserName,
    otherUserRole,
    onStartCall
}: CallInitiationModalProps) {
    const { user } = useAuth()
    const [waitingTime, setWaitingTime] = useState(0)

    useEffect(() => {
        if (isOpen) {
            const interval = setInterval(() => {
                setWaitingTime(prev => prev + 1)
            }, 1000)

            return () => clearInterval(interval)
        }
    }, [isOpen])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getTitle = () => {
        if (user?.role === 'STUDENT') {
            return `Ready to connect with ${otherUserName}`
        } else {
            return `Ready to help ${otherUserName}`
        }
    }

    const getMessage = () => {
        if (user?.role === 'STUDENT') {
            return `${otherUserName} has accepted your doubt request. You can now start the video call when you're ready.`
        } else {
            return `You've accepted ${otherUserName}'s doubt request. Start the video call when you're ready to help.`
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-white border shadow-lg">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="flex items-center text-slate-800">
                        <Video className="h-5 w-5 mr-2" />
                        Video Call Ready
                    </DialogTitle>
                </DialogHeader>

                <div className="pt-4 space-y-6">
                    {/* Success Icon */}
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            {getTitle()}
                        </h3>
                        <p className="text-slate-600 mb-4">
                            {getMessage()}
                        </p>
                    </div>

                    {/* Doubt Details */}
                    {doubt && (
                        <div className="bg-slate-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                    {doubt.subject?.replace(/_/g, " ")}
                                </Badge>
                                <Badge className="text-xs bg-blue-100 text-blue-800">
                                    {doubt.priority}
                                </Badge>
                            </div>
                            <h4 className="font-medium text-slate-800 mb-1">
                                {doubt.title}
                            </h4>
                            <p className="text-sm text-slate-600 line-clamp-2">
                                {doubt.description}
                            </p>
                        </div>
                    )}

                    {/* Connection Info */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                            <Users className="h-5 w-5 text-blue-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900">
                                    {user?.role === 'STUDENT' ? 'Your Tutor' : 'Student'}
                                </p>
                                <p className="text-sm text-blue-700">{otherUserName}</p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center space-x-1 text-xs text-blue-600">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTime(waitingTime)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Call Actions */}
                    <div className="space-y-3">
                        <Button 
                            onClick={onStartCall}
                            className="w-full bg-green-600 hover:bg-green-700"
                            size="lg"
                        >
                            <Video className="h-5 w-5 mr-2" />
                            Start Video Call
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={onClose}
                            className="w-full"
                        >
                            Cancel
                        </Button>
                    </div>

                    {/* Tips */}
                    <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
                        <p className="font-medium mb-1 flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5" /> Before starting the call:</p>
                        <ul className="space-y-1">
                            <li>• Make sure your camera and microphone are working</li>
                            <li>• Find a quiet, well-lit space</li>
                            <li>• Have your materials ready</li>
                            {user?.role === 'TUTOR' && (
                                <li>• Review the doubt details above</li>
                            )}
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}