# NerdsOnCall

<<<<<<< HEAD
**Real-Time Doubt-Solving Platform**
=======
**Real-time doubt-solving — students, tutors, live video, and instant help.**
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2

<p align="center">
  <a href="https://nerds-on-call.vercel.app/"><strong>Live app</strong></a>
  &nbsp;·&nbsp;
  <a href="https://nerdsoncall-api.shivam.app/health"><strong>API health</strong></a>
  &nbsp;·&nbsp;
  <a href="#quick-start">Run locally</a>
  &nbsp;·&nbsp;
  <a href="#deployment">Deployment</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel" alt="Frontend on Vercel" />
  <img src="https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/DB-PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/AI-Groq-000000" alt="Groq" />
  <img src="https://img.shields.io/badge/Payments-Razorpay-0C2451" alt="Razorpay" />
</p>

## Project Overview

<<<<<<< HEAD
NerdsOnCall is a real-time educational platform that connects students with tutors for instant doubt resolution through live video calls, interactive whiteboards, and screen sharing capabilities.
=======
## What is this?

NerdsOnCall connects **students** with **tutors** for:
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2

- Live **1:1 video** (WebRTC)
- Shared **whiteboard** and **screen share**
- **Doubts**, public **Q&A**, and **subscriptions** (Razorpay, INR)
- **AI study assistant** (Groq, server-side on the frontend)

<<<<<<< HEAD
-   **Live Video Calls**: WebRTC-powered real-time communication
-   **Interactive Whiteboard**: Shared canvas for visual explanations
-   **Screen Sharing**: Full screen or window sharing capabilities
-   **Real-Time Matching**: Instant tutor-student connections
-   **Subscription Management**: Flexible billing plans via Stripe
-   **Session History**: Complete logs and feedback system
-   **WebSocket Communication**: Real-time updates and signaling

## Architecture
=======
### Features

- Live video calls (WebRTC, peer-to-peer signalling via backend WebSockets)
- Real-time whiteboard / canvas sync
- Screen sharing
- Tutor online status and matching
- Student doubts and tutor solve flow
- Community questions board with video solutions
- Subscription plans (Razorpay Checkout)
- PDF receipts by email on purchase
- Media uploads (Cloudinary)

---

## Live URLs
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2

| Service | URL | Role |
| --- | --- | --- |
| **Frontend** | [https://nerds-on-call.vercel.app/](https://nerds-on-call.vercel.app/) | Next.js app (Vercel) |
| **Backend API** | [https://nerdsoncall-api.shivam.app/](https://nerdsoncall-api.shivam.app/) | Spring Boot REST + WebSockets |
| **Health** | [https://nerdsoncall-api.shivam.app/health](https://nerdsoncall-api.shivam.app/health) | Liveness |
| **DB health** | [https://nerdsoncall-api.shivam.app/health/db](https://nerdsoncall-api.shivam.app/health/db) | PostgreSQL check |

<<<<<<< HEAD
-   **Framework**: Spring Boot 3.2.0
-   **Database**: PostgreSQL (via Supabase)
-   **Authentication**: JWT-based authentication
-   **Real-time**: WebSocket + STOMP protocol
-   **Payments**: Stripe integration
-   **WebRTC Signaling**: Custom WebSocket handlers

### Frontend (Next.js)

-   **Framework**: Next.js 15.3.4 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS v4
-   **State Management**: React Context + TanStack Query v5
-   **Real-time**: Socket.IO Client
-   **Video Calls**: WebRTC with Simple Peer
-   **Payments**: Stripe.js integration
=======
The frontend calls the API with `NEXT_PUBLIC_API_URL`. WebSockets use the same host with `wss://` (derived from that URL).
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2

### Prerequisites

<<<<<<< HEAD
-   Java 17+
-   Node.js 18+
-   PostgreSQL database
-   Stripe account for payments

### Backend Setup
=======
## Architecture

```mermaid
flowchart TB
  subgraph browser [Browser]
    UI[Next.js on Vercel]
  end
  subgraph vercel [Vercel]
    UI
    ChatRoute["/api/chat → Groq"]
  end
  subgraph vps [Backend host]
    Nginx[Nginx HTTPS]
    API[Spring Boot :8080]
    PG[(PostgreSQL)]
    Nginx --> API
    API --> PG
  end
  UI -->|REST + WSS| Nginx
  UI --> ChatRoute
  API --> Cloudinary[Cloudinary]
  API --> Razorpay[Razorpay]
  API --> Gmail[Gmail SMTP]
```

## Tech stack

### Backend (`Server/`)

| Layer | Technology |
| --- | --- |
| Runtime | Java 17, Spring Boot 3.2 |
| API | Spring Web, Spring Security, JWT |
| Data | Spring Data JPA, **PostgreSQL** |
| Real-time | Native WebSockets (`/ws/webrtc`, `/ws/session`) |
| Payments | Razorpay Java SDK |
| Media | Cloudinary SDK |
| Email / PDF | Spring Mail (SMTP), iText 7 |
| Config | `Server/.env` via `spring-dotenv` |

### Frontend (`Client/`)

| Layer | Technology |
| --- | --- |
| Framework | **Next.js 15.5** (App Router), React 18, TypeScript |
| Styling | Tailwind CSS v4 |
| Data | TanStack Query v5, Axios, React Context |
| Real-time | Native `WebSocket` + browser WebRTC |
| UI | Radix primitives, `lucide-react`, `react-hot-toast` |
| AI chat | Groq `llama-3.1-8b-instant` in `app/api/chat/route.ts` only |
| Payments | Razorpay Checkout (script tag, no Stripe) |

**Not used:** Socket.IO, STOMP, Supabase, OpenAI, Gemini, Stripe, MySQL, MongoDB.

---

## Quick start

### Prerequisites

- Java 17+, Maven 3.9+
- Node.js 18+
- PostgreSQL 14+
- Accounts: [Razorpay](https://razorpay.com/), [Cloudinary](https://cloudinary.com/), Gmail app password, [Groq](https://console.groq.com/keys) (free)

### 1. Backend

```bash
cd Server
# Copy and edit env — see Server/.env.example
mvn spring-boot:run
```

→ [http://localhost:8080](http://localhost:8080) · [http://localhost:8080/health](http://localhost:8080/health)

### 2. Frontend

```bash
cd Client
npm install
# Set NEXT_PUBLIC_API_URL=http://localhost:8080 and GROQ_API_KEY in .env
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

### Environment variables

**Backend** (`Server/.env`):

| Variable | Purpose |
| --- | --- |
| `PORT` | Server port (default `8080`) |
| `FRONTEND_URL` | Frontend base URL (password-reset links) |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | PostgreSQL |
| `JWT_SECRET` | JWT signing (long random string in production) |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | Gmail SMTP |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Uploads |

**Frontend** (`Client/.env`):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL (no trailing slash) |
| `GROQ_API_KEY` | Server-only; `/api/chat` route |

**Production example:**

```env
# Vercel
NEXT_PUBLIC_API_URL=https://nerdsoncall-api.shivam.app
GROQ_API_KEY=gsk_...

# Backend
FRONTEND_URL=https://nerds-on-call.vercel.app
```

---

## Deployment

| Part | Host | Notes |
| --- | --- | --- |
| Frontend | **Vercel** | Root directory: `Client`. Set env vars in project settings. |
| Backend | **VPS** (Oracle Instance) | JAR + systemd + Nginx + Let's Encrypt |
| Database | **PostgreSQL on same VPS** | Not a separate paid DB service |
| AI chat | **Vercel** | Groq key only in Vercel; never exposed to browser |

Backend must be served over **HTTPS** so the Vercel app can call REST and **WSS** without mixed-content errors.

### Smoke test after deploy

1. Open [https://nerds-on-call.vercel.app/](https://nerds-on-call.vercel.app/)
2. Register / log in
3. Confirm network calls go to `https://nerdsoncall-api.shivam.app`
4. Check [https://nerdsoncall-api.shivam.app/health/db](https://nerdsoncall-api.shivam.app/health/db) → `"status":"UP"`
5. Test video call (WebSocket + WebRTC)
6. Test AI chat on `/chat` (Groq via Vercel route)

---

## Project structure

```
NerdsOnCall/
├── Client/                 # Next.js frontend
│   └── README_FRONTEND.md
├── Server/                 # Spring Boot backend
│   └── README_BACKEND.md
└── README.md               # You are here
```
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2

1. Navigate to `Server/` directory
2. Configure `application.yml` with database and Stripe credentials
3. Run `mvn spring-boot:run`
4. Server starts on `http://localhost:8080`

<<<<<<< HEAD
### Frontend Setup

1. Navigate to `Client/` directory
2. Install dependencies: `npm install`
3. Configure environment variables in `.env.local`
4. Run development server: `npm run dev`
5. Application available at `http://localhost:3000`

Built for education and learning
=======
## Docs

- [Client/README_FRONTEND.md](Client/README_FRONTEND.md) — routes, hooks, Razorpay, WebSockets
- [Server/README_BACKEND.md](Server/README_BACKEND.md) — REST map, WebSockets, schedulers, schema

---

## Contributing

1. Fork → branch → PR
2. Never commit `.env` files or API keys
3. Run `mvn test` / `npm run build` before pushing

---

<p align="center">
  Built for real-time learning — <a href="https://nerds-on-call.vercel.app/">open the app</a>
</p>
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
