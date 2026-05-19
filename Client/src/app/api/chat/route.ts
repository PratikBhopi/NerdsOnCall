import { NextRequest, NextResponse } from "next/server"

const GROQ_MODEL = "llama-3.1-8b-instant"
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const MAX_TOKENS = 384
const MAX_HISTORY = 6

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const windowMs = 60 * 1000
    const maxRequests = 25

    const record = rateLimitMap.get(ip)

    if (!record || now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
        return true
    }

    if (record.count >= maxRequests) {
        return false
    }

    record.count++
    return true
}

function buildSystemPrompt(userRole: string): string {
    const role = userRole === "tutor" ? "tutor" : "student"

    return `You are NerdsOnCall Study Assistant — a quick helper on the NerdsOnCall tutoring platform (live tutors, video calls, doubt solving).

User role: ${role}.

Rules:
- Keep every reply SHORT: 2–6 sentences or a few bullet points. No long essays.
- Be direct and friendly. Skip filler and repetition.
- For math/science use LaTeX: inline $...$, display $$...$$ when needed.
- Students: give a clear hint or mini-explanation first; nudge them to try the next step. For big problems, suggest posting a doubt or booking a live tutor on NerdsOnCall.
- Tutors: brief teaching tips, how to explain simply, or session ideas — stay practical.
- Never claim you are a human tutor. You complement live tutors on the platform.
- If unsure, say so in one line and suggest what info you need.`
}

type ChatMessage = { role: string; content: string }

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GROQ_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: "Chat is not configured (missing GROQ_API_KEY)." },
                { status: 503 }
            )
        }

        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            req.headers.get("x-real-ip") ||
            "unknown"

        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Please wait a moment before trying again." },
                { status: 429 }
            )
        }

        const { messages, userRole } = await req.json()

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: "Invalid messages format." },
                { status: 400 }
            )
        }

        const role = typeof userRole === "string" ? userRole : "student"
        const recentMessages = (messages as ChatMessage[]).slice(-MAX_HISTORY)

        const groqMessages = [
            { role: "system", content: buildSystemPrompt(role) },
            ...recentMessages.map((m) => ({
                role: m.role === "assistant" ? "assistant" : "user",
                content: m.content,
            })),
        ]

        const groqRes = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: groqMessages,
                max_tokens: MAX_TOKENS,
                temperature: 0.4,
                top_p: 0.9,
            }),
        })

        const data = await groqRes.json()

        if (!groqRes.ok) {
            const errMsg =
                data?.error?.message || data?.error?.code || "Groq API request failed"
            console.error("Groq API error:", groqRes.status, data)

            if (groqRes.status === 401) {
                return NextResponse.json(
                    { error: "Invalid Groq API key." },
                    { status: 401 }
                )
            }
            if (groqRes.status === 429) {
                return NextResponse.json(
                    { error: "AI is busy right now. Please try again in a moment." },
                    { status: 429 }
                )
            }

            return NextResponse.json({ error: errMsg }, { status: 502 })
        }

        const text: string = data?.choices?.[0]?.message?.content?.trim() ?? ""

        if (!text) {
            return NextResponse.json(
                { error: "Empty response from AI. Please try rephrasing your question." },
                { status: 502 }
            )
        }

        return NextResponse.json({ message: text })
    } catch (error: unknown) {
        console.error("Chat route error:", error)
        return NextResponse.json(
            { error: "Failed to get a response. Please try again." },
            { status: 500 }
        )
    }
}
