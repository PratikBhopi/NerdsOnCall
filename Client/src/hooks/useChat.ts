import { useState, useCallback } from "react"
import { toast } from "react-hot-toast"
import { getUserFriendlyErrorMessage } from "@/utils/errorMessages"

export interface ChatMessage {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
}

export interface UseChatOptions {
    userRole?: string
    onError?: (error: string) => void
}

export function useChat(options: UseChatOptions = {}) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim() || isLoading) return

            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                role: "user",
                content: content.trim(),
                timestamp: new Date(),
            }

            setMessages((prev) => [...prev, userMessage])
            setIsLoading(true)

            try {
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        messages: [...messages, userMessage].map((msg) => ({
                            role: msg.role,
                            content: msg.content,
                        })),
                        userRole: options.userRole || "student",
                    }),
                })

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    const serverError = errorData.error || "Failed to get response"

                    if ([401, 403, 429, 503].includes(response.status)) {
                        const assistantMessage: ChatMessage = {
                            id: (Date.now() + 1).toString(),
                            role: "assistant",
                            content: serverError,
                            timestamp: new Date(),
                        }
                        setMessages((prev) => [...prev, assistantMessage])
                        return assistantMessage
                    }

                    throw new Error(serverError)
                }

                const data = await response.json()

                const assistantMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.message,
                    timestamp: new Date(),
                }

                setMessages((prev) => [...prev, assistantMessage])
                return assistantMessage
            } catch (error: any) {
                console.error("Chat error:", error?.message || error)
                const errorMessage = getUserFriendlyErrorMessage(error, "chat")

                if (options.onError) {
                    options.onError(errorMessage)
                } else {
                    toast.error(errorMessage)
                }

                const errorResponse: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content:
                        "I'm sorry, I encountered an error while processing your request. Please try again or rephrase your question.",
                    timestamp: new Date(),
                }
                setMessages((prev) => [...prev, errorResponse])
                return errorResponse
            } finally {
                setIsLoading(false)
            }
        },
        [messages, isLoading, options]
    )

    const clearMessages = useCallback(() => {
        setMessages([])
    }, [])

    const addMessage = useCallback(
        (message: Omit<ChatMessage, "id" | "timestamp">) => {
            const newMessage: ChatMessage = {
                ...message,
                id: Date.now().toString(),
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, newMessage])
            return newMessage
        },
        []
    )

    return {
        messages,
        isLoading,
        sendMessage,
        clearMessages,
        addMessage,
    }
}
