# NerdsOnCall

**Real-Time Doubt-Solving Platform**

A web platform that connects students with tutors for instant doubt resolution
over live video, with a shared whiteboard, screen sharing, and in-call chat.

## Overview

NerdsOnCall lets a student raise a doubt, get matched with an available tutor,
and immediately enter a live tutoring session. Sessions are gated by a
subscription plan (purchased through Razorpay). All real-time communication
(WebRTC signalling, whiteboard sync, screen share) is handled by the Spring
Boot backend over native WebSockets.

## Features

- Live 1:1 video calls (WebRTC, peer-to-peer)
- Shared whiteboard / canvas with real-time sync
- Screen sharing
- Tutor presence / online status
- Student doubt creation and tutor matching
- Public Q&A board (questions + tutor solutions)
- Subscription plans via **Razorpay** (INR)
- Monthly tutor payouts (currently stubbed via `RazorpayPayoutService`)
- PDF receipts emailed to students on subscription purchase
- File / video uploads via Cloudinary
- AI study assistant for students/tutors (Groq / llama-3.1-8b-instant, Next.js route handler)

## Tech Stack

### Backend (`Server/`)
- Java 17, Spring Boot 3.2.0
- Spring Security + JWT auth (no OAuth providers)
- Spring Data JPA + PostgreSQL
- Native WebSockets (`/ws/webrtc`, `/ws/session`) — no STOMP, no Socket.IO
- Razorpay Java SDK (payments)
- Cloudinary SDK (media uploads)
- iText 7 (PDF receipts)
- Spring Mail (SMTP, Gmail)
- `spring-dotenv` auto-loads `Server/.env`

### Frontend (`Client/`)
- Next.js 15 (App Router), React 18, TypeScript
- Tailwind CSS v4
- TanStack Query v5 + React Context
- Axios
- Native `WebSocket` (no Socket.IO)
- WebRTC via the browser API
- `react-hot-toast`, `lucide-react`, `react-grid-layout`
- `katex` + `react-markdown` for math rendering in chat
- Groq API — `llama-3.1-8b-instant` (only inside the `/api/chat` Next.js route)

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+
- PostgreSQL 14+
- Accounts: Razorpay (test mode is fine), Cloudinary, Gmail SMTP, Groq API key

## Setup

### 1. Backend

```bash
cd Server
cp .env .env.local   # then edit values, or just edit Server/.env directly
mvn spring-boot:run
```

The server starts on `http://localhost:8080`. On first run, JPA will create
the schema in the configured PostgreSQL database (`ddl-auto: update`).

Required env vars (see `Server/.env`):

| Variable | Purpose |
| --- | --- |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | PostgreSQL connection |
| `JWT_SECRET` | Signing key for JWTs (use a 256+ bit secret in prod) |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | Gmail SMTP credentials (app password) |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay API credentials |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary uploads |
| `FRONTEND_URL` | Base URL of the frontend (used in password reset links) |
| `PORT` | Server port (defaults to `8080`) |

### 2. Frontend

```bash
cd Client
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

Required env vars in `Client/.env` (or `.env.local`):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL, e.g. `http://localhost:8080` |
| `GROQ_API_KEY` | Groq key for the `/api/chat` route (server-side only, get one free at console.groq.com) |

## Project Structure

```
NerdsOnCall/
├── Client/   Next.js frontend
├── Server/   Spring Boot backend
└── README.md
```

For module-level details, see `Server/README_BACKEND.md` and
`Client/README_FRONTEND.md`.
