"use client"

import { useRef, useEffect, useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/Button"
import { ChatMessage } from "@/components/chat/ChatMessage"
import { ChatInput } from "@/components/chat/ChatInput"
import { useChat } from "@/hooks/useChat"
import {
    Bot,
    Trash2,
    Loader2,
    BookOpen,
    Calculator,
    Lightbulb,
    MessageSquare,
} from "lucide-react"
import { toast } from "react-hot-toast"
import "katex/dist/katex.min.css"

export default function ChatPage() {
    const { user } = useAuth()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { messages, isLoading, sendMessage, clearMessages } = useChat({
        userRole: user?.role || "student",
        onError: (error) => toast.error(error),
    })

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleClearChat = () => {
        clearMessages()
        toast.success("Chat cleared")
    }

    const quickPrompts = [
        {
            icon: Calculator,
            text: "Explain quadratic equations",
            prompt: "Can you explain quadratic equations with step-by-step examples and show me the quadratic formula?",
        },
        {
            icon: BookOpen,
            text: "Study tips for exams",
            prompt: "What are some effective study strategies for preparing for exams? Include memory techniques and time management.",
        },
        {
            icon: Lightbulb,
            text: "Physics concepts",
            prompt: "Help me understand Newton's laws of motion with real-world examples and mathematical formulations.",
        },
        {
            icon: MessageSquare,
            text: "Teaching strategies",
            prompt: "What are some effective online teaching strategies for engaging students in virtual classrooms?",
        },
    ]

    return (
        <div className="min-h-screen bg-yellow-100">
            <Navbar />

            {/* Main Container */}
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black border-4 border-black shadow-[6px_6px_0px_0px_black] mb-4">
                        <Bot className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-black mb-2 uppercase tracking-wide">
                        AI Assistant
                    </h1>
                    <p className="text-lg font-bold text-black uppercase tracking-wide mb-4">
                        Get instant help with your studies
                    </p>

                    {/* Status and Clear Button Row */}
                    <div className="flex items-center justify-center gap-6 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 border-2 border-black"></div>
                            <span className="text-sm font-bold text-black uppercase tracking-wide">
                                Online{" "}
                                {user &&
                                    `• ${
                                        user.role === "STUDENT"
                                            ? "Student"
                                            : "Tutor"
                                    } Mode`}
                            </span>
                        </div>

                        {messages.length > 0 && (
                            <Button
                                onClick={handleClearChat}
                                className="bg-red-400 hover:bg-red-500 text-black border-3 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all font-black uppercase tracking-wide text-xs px-4 py-2"
                            >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Quick Prompts - Show when no messages */}
                {messages.length === 0 && !isLoading && (
                    <div className="mb-8">
                        <p className="text-xl font-black text-black mb-6 text-center uppercase tracking-wide">
                            Quick Start Prompts
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {quickPrompts.map((prompt, index) => (
                                <Button
                                    key={index}
                                    onClick={() => sendMessage(prompt.prompt)}
                                    className="justify-start h-auto p-4 text-left bg-white hover:bg-gray-100 border-3 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all"
                                    disabled={isLoading}
                                >
                                    <prompt.icon className="w-6 h-6 mr-3 text-black flex-shrink-0" />
                                    <span className="text-sm text-black font-bold">
                                        {prompt.text}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages Area - Clean, No Box */}
                <div className="space-y-6 mb-8 min-h-[300px]">
                    {messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                    ))}

                    {isLoading && (
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-black border-3 border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center">
                                <Bot className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div className="flex-1">
                                <div className="inline-block p-4 bg-white border-3 border-black shadow-[4px_4px_0px_0px_black]">
                                    <div className="flex items-center space-x-3">
                                        <Loader2 className="w-5 h-5 animate-spin text-black" />
                                        <span className="text-black text-sm font-bold uppercase tracking-wide">
                                            AI is thinking...
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area - Clean and Minimal */}
                <div className="sticky bottom-0 bg-yellow-100 pt-4 pb-8">
                    <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_black] p-4">
                        <ChatInput
                            onSendMessage={sendMessage}
                            isLoading={isLoading}
                            placeholder="Ask me anything about your studies..."
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
