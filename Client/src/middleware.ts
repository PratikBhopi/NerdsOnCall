import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

function isValidToken(token: string): boolean {
    if (!token) return false

    try {
        // Basic JWT structure check
        const parts = token.split(".")
        if (parts.length !== 3) return false

        // Decode payload to check expiration
        const payload = JSON.parse(atob(parts[1]))
        const now = Math.floor(Date.now() / 1000)

        // Check if token is expired
        if (payload.exp && payload.exp < now) {
            return false
        }

        return true
    } catch (error) {
        return false
    }
}

export function middleware(request: NextRequest) {
    const token =
        request.cookies.get("token")?.value ||
        request.headers.get("authorization")?.replace("Bearer ", "")

    // Protected routes that require authentication
    const protectedPaths = [
        "/dashboard",
        "/profile",
        "/my-sessions",
        "/my-questions",
        "/my-students",
        "/doubts",
        "/questions",
        "/browse-tutors",
        "/select-tutor",
        "/ask-question",
        "/video-call",
        "/chat",
    ]
    const authPaths = [
        "/auth/login",
        "/auth/register",
        "/auth/forgot-password",
        "/reset-password",
    ]

    const isProtectedPath = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    )

    const isAuthPath = authPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    )

    // Check if token is valid
    const hasValidToken = token && isValidToken(token)

    // If accessing protected route without valid token, redirect to login
    if (isProtectedPath && !hasValidToken) {
        // Clear invalid token cookie if it exists
        const response = NextResponse.redirect(
            new URL("/auth/login", request.url)
        )
        if (token && !hasValidToken) {
            response.cookies.delete("token")
        }
        return response
    }

    // If accessing auth pages with valid token, redirect to dashboard
    if (isAuthPath && hasValidToken) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // If accessing auth pages with invalid token, clear the token and allow access
    if (isAuthPath && token && !hasValidToken) {
        const response = NextResponse.next()
        response.cookies.delete("token")
        return response
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/profile/:path*",
        "/my-sessions/:path*",
        "/my-questions/:path*",
        "/my-students/:path*",
        "/doubts/:path*",
        "/questions/:path*",
        "/browse-tutors/:path*",
        "/select-tutor/:path*",
        "/ask-question/:path*",
        "/video-call/:path*",
        "/chat/:path*",
        "/auth/login",
        "/auth/register",
        "/auth/forgot-password",
        "/reset-password",
    ],
}
