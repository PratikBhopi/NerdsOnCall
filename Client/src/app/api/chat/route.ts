import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

// Simple rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute
    const maxRequests = 20 // 20 requests per minute

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

export async function POST(req: NextRequest) {
    try {
        // Rate limiting
        const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown"
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                {
                    error: "Too many requests. Please wait a moment before trying again.",
                },
                { status: 429 }
            )
        }

        const { messages, userRole } = await req.json()

        // Validate input
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: "Invalid messages format" },
                { status: 400 }
            )
        }

        // Limit message history to prevent token overflow
        const recentMessages = messages.slice(-10)

        // System prompt optimized for NerdsOnCall platform
        const systemPrompt = `You are NerdsOnCall AI Assistant, an intelligent tutoring bot designed to help students and tutors on the NerdsOnCall platform.

ROLE CONTEXT: The user is a ${userRole || "student"}.

CORE CAPABILITIES:
- Provide detailed explanations for academic subjects (Math, Physics, Chemistry, Biology, Computer Science, etc.)
- Show step-by-step solutions with clear reasoning
- Use LaTeX notation for mathematical equations (wrap in $ for inline, $$ for block equations)
- Adapt explanations based on user's academic level
- Encourage learning through guided questions rather than just giving answers
- Support multiple learning styles (visual, auditory, kinesthetic)

MATHEMATICAL FORMATTING:
- Always use LaTeX for mathematical expressions
- Examples: $x^2 + y^2 = r^2$, $$\\int_{0}^{\\infty} e^{-x} dx = 1$$
- Use proper mathematical notation and symbols
- Break down complex equations into steps

TUTORING APPROACH:
For Students:
- Ask clarifying questions to understand their level
- Provide encouraging, patient responses
- Break complex topics into digestible parts
- Offer practice problems and examples
- Suggest study strategies and resources

For Tutors:
- Provide teaching strategies and methodologies
- Suggest ways to explain difficult concepts
- Offer assessment techniques
- Share best practices for online tutoring
- Help with lesson planning and curriculum design

PLATFORM INTEGRATION:
- Mention relevant NerdsOnCall features when appropriate
- Encourage users to connect with live tutors for complex problems
- Suggest using the platform's doubt-solving features
- Promote collaborative learning

RESPONSE STYLE:
- Be conversational yet professional
- Use clear, concise language
- Include relevant examples and analogies
- Provide actionable advice
- Always be encouraging and supportive

Remember: You're part of the NerdsOnCall ecosystem, designed to complement human tutors, not replace them.`

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                ...recentMessages,
            ],
            temperature: 0.7,
            max_tokens: 2000,
            presence_penalty: 0.1,
            frequency_penalty: 0.1,
        })

        const response =
            completion.choices[0]?.message?.content ||
            "I'm sorry, I couldn't generate a response. Please try again."

        return NextResponse.json({
            message: response,
            usage: completion.usage,
        })
    } catch (error: any) {
        console.error("OpenAI API error:", error)

        if (error.code === "insufficient_quota") {
            return NextResponse.json(
                { error: "API quota exceeded. Please try again later." },
                { status: 429 }
            )
        }

        if (error.code === "invalid_api_key") {
            return NextResponse.json(
                { error: "Invalid API configuration." },
                { status: 401 }
            )
        }

        return NextResponse.json(
            {
                error: "Failed to get response from AI assistant. Please try again.",
            },
            { status: 500 }
        )
    }
}
