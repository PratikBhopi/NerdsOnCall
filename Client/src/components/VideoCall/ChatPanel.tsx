"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Send, X } from "lucide-react"

interface Message {
    id: string
    userId: number
    userName: string
    message: string
    timestamp: Date
    type: "text" | "system"
}

interface ChatPanelProps {
    sessionId: string
    isOpen: boolean
    onClose: () => void
    socket?: WebSocket | null
    user?: any
    messages?: any[]
    onSendMessage?: (message: string) => void
}

export function ChatPanel({
    sessionId,
    isOpen,
    onClose,
    socket,
    user,
    messages = [],
    onSendMessage,
}: ChatPanelProps) {
    const [newMessage, setNewMessage] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Handle typing indicators via WebSocket
    useEffect(() => {
        if (socket) {
            const handleMessage = (event: MessageEvent) => {
                try {
                    const data = JSON.parse(event.data)
                    if (data.type === "user_typing") {
                        setIsTyping(parseInt(data.userId) !== user?.id)
                        setTimeout(() => setIsTyping(false), 3000)
                    }
                } catch (error) {
                    console.error("Error parsing typing message:", error)
                }
            }

            socket.addEventListener("message", handleMessage)
            return () => socket.removeEventListener("message", handleMessage)
        }
    }, [socket, user?.id])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const sendMessage = () => {
        if (!newMessage.trim()) {
            console.log("Cannot send empty message")
            return
        }

        if (onSendMessage) {
            console.log("Sending message via callback:", newMessage.trim())
            onSendMessage(newMessage.trim())
        } else if (socket && user) {
            // Fallback to direct WebSocket sending
            const message = {
                type: "chat_message",
                sessionId,
                userId: user.id,
                userName: `${user.firstName} ${user.lastName}`,
                message: newMessage.trim(),
                timestamp: new Date().toISOString(),
                id: Date.now().toString(),
            }

            console.log("Sending chat message via WebSocket:", message)
            socket.send(JSON.stringify(message))
        } else {
            console.log("No send method available")
            return
        }

        setNewMessage("")
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const handleTyping = () => {
        if (socket && user) {
            socket.send(
                JSON.stringify({
                    type: "user_typing",
                    sessionId,
                    userId: user.id,
                    userName: `${user.firstName} ${user.lastName}`,
                })
            )
        }
    }

    if (!isOpen) return null

    return (
        <div className="w-full bg-yellow-100 border-3 border-black shadow-[4px_4px_0px_0px_black] flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b-3 border-black bg-yellow-300">
                <h3 className="font-black text-black uppercase tracking-wide">
                    Live Chat
                </h3>
                <Button
                    onClick={onClose}
                    className="h-8 w-8 p-0 bg-red-400 hover:bg-red-500 border-2 border-black shadow-[2px_2px_0px_0px_black] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_black] transition-all"
                >
                    <X className="h-4 w-4 text-black font-black" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-yellow-50">
                {messages.length === 0 ? (
                    <div className="text-center text-black font-bold text-sm mt-8">
                        <p className="mb-2">No messages yet</p>
                        <p className="text-xs uppercase tracking-wide">
                            Start the conversation!
                        </p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${
                                Number(message.userId) === user?.id
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-3 py-2 border-2 border-black shadow-[2px_2px_0px_0px_black] ${
                                    Number(message.userId) === user?.id
                                        ? "bg-blue-400 text-black font-bold"
                                        : "bg-white text-black font-bold"
                                }`}
                            >
                                {Number(message.userId) !== user?.id && (
                                    <div className="text-xs font-black mb-1 uppercase tracking-wide">
                                        {message.userName}
                                    </div>
                                )}
                                <div className="text-sm font-bold">
                                    {message.message}
                                </div>
                                <div className="text-xs mt-1 font-bold opacity-70">
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                <div
                                    className="w-2 h-2 bg-black rounded-full animate-bounce"
                                    style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                    className="w-2 h-2 bg-black rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t-3 border-black bg-yellow-200">
                <div className="flex space-x-2">
                    <Input
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value)
                            handleTyping()
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 bg-white border-2 border-black font-bold text-black placeholder:text-gray-600 focus:outline-none focus:shadow-[2px_2px_0px_0px_black]"
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-green-400 hover:bg-green-500 disabled:bg-gray-300 text-black font-black px-4 border-2 border-black shadow-[2px_2px_0px_0px_black] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_black] transition-all disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[2px_2px_0px_0px_black]"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
