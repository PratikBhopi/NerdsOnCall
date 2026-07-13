import { NextRequest, NextResponse } from "next/server"

<<<<<<< HEAD
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
      })
    : null
=======
const GROQ_MODEL = "llama-3.1-8b-instant"
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const MAX_TOKENS = 384
const MAX_HISTORY = 6
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2

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
<<<<<<< HEAD
        // Rate limiting
        const ip =
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "unknown"
=======
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

>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
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

<<<<<<< HEAD
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

        if (!openai) {
            return NextResponse.json(
                { error: "OpenAI API is not configured" },
                { status: 503 }
            )
        }

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
=======
        const groqRes = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
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
