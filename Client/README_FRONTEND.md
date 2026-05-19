# NerdsOnCall Frontend

Next.js 15 (App Router) frontend for the NerdsOnCall doubt-solving platform.

## Stack

- Next.js 15.3.4, React 18, TypeScript
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- TanStack Query v5
- Axios (REST)
- Native browser `WebSocket` + WebRTC APIs (no Socket.IO, no STOMP)
- `react-hot-toast` (only toast library — `sonner` was removed)
- `lucide-react` icons
- `react-grid-layout` for the in-call layout
- `react-markdown` + `katex` + `remark-math` + `rehype-katex` for the AI chat
- Groq API (`llama-3.1-8b-instant`) — used only on the server inside `app/api/chat/route.ts` (via REST, no extra SDK)
- Radix UI primitives + small custom UI components (`components/ui/*`)

Payments use **Razorpay Checkout**, loaded on demand from
`https://checkout.razorpay.com/v1/checkout.js`. There is no Stripe code.

## Running locally

```bash
cd Client
npm install
npm run dev
```

Then open `http://localhost:3000`.

If you see `ENOENT ... node_modules/buffer/index.js` after changing dependencies, stale webpack cache is the usual cause. Run `npm run clean`, then `npm run dev` (or `npm run build`).

## Environment variables

Only two are needed:

| Variable | Where it's read | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Browser (`lib/api.ts`) | Base URL of the Spring backend |
| `GROQ_API_KEY` | Server (`app/api/chat/route.ts`) | Groq (`llama-3.1-8b-instant`) for the AI chat assistant |

Copy `.env.example` to `.env` and set your key from [https://console.groq.com/keys](https://console.groq.com/keys). `.env` is git-ignored.

The chat route uses **llama-3.1-8b-instant** on Groq with a short NerdsOnCall-specific system prompt and a 384-token cap. Groq's free tier is very generous (30 req/min) so the chatbot works reliably out of the box.

## App routes (App Router)

```
app/
├── page.tsx                       # Landing
├── HomePageClient.tsx             # Landing client component
├── about/page.tsx
├── features/page.tsx
├── pricing/page.tsx               # Plans + Razorpay checkout
├── auth/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
├── reset-password/page.tsx
├── dashboard/page.tsx             # Role-aware dashboard
├── profile/page.tsx               # Current user profile
├── profile/[id]/page.tsx          # Public profile
├── browse-tutors/page.tsx
├── select-tutor/page.tsx
├── ask-question/page.tsx
├── questions/page.tsx             # Public Q&A list
├── questions/ask/page.tsx
├── questions/[id]/page.tsx
├── questions/[id]/answer/page.tsx
├── my-questions/page.tsx
├── my-sessions/page.tsx
├── my-students/page.tsx
├── doubts/[id]/solve/page.tsx     # Tutor's solve view
├── chat/page.tsx                  # AI chat
├── video-call/[sessionId]/page.tsx
└── api/chat/route.ts              # Server route; calls Groq (llama-3.1-8b-instant)
```

## Source layout

```
src/
├── app/                  # Routes (see above)
├── components/
│   ├── ui/               # Buttons, inputs, dialogs, cards, etc.
│   ├── layout/           # Navbar, Footer, TutorCallProvider
│   ├── landing/          # Hero, Features, HowItWorks, Pricing
│   ├── auth/             # AuthPageGuard
│   ├── questions/        # QuestionList, QuestionCard
│   ├── Doubt/            # DoubtForm + call modals
│   ├── VideoCall/        # Canvas, ChatPanel, call notifications, modal
│   ├── chat/             # ChatInput, ChatMessage, ChatLoading
│   └── providers.tsx     # QueryClient + Auth + WebSocket + TutorCall providers
├── context/
│   ├── AuthContext.tsx   # Token storage + /auth/me bootstrap
│   └── WebSocketContext.tsx # /ws/webrtc connection
├── hooks/                # useChat, useDashboard, useTutorDashboard
├── lib/                  # api (axios), subscription, currency, utils
├── types/                # Shared TypeScript types
├── utils/errorMessages.ts
└── middleware.ts         # Token-based route protection
```

## Authentication

`AuthContext` stores the JWT in `localStorage` and mirrors it to a `token`
cookie so `middleware.ts` (which only sees cookies) can protect routes
server-side.

`lib/api.ts` adds an `Authorization: Bearer <token>` header on every request
and clears the token on `401` responses or when it detects an expired JWT.

## Real-time

- **WebRTC signalling**: `WebSocketContext` opens `ws://<api>/ws/webrtc` once
  the user is authenticated and reuses it for incoming-call notifications and
  the in-call signalling.
- **Whiteboard / screen share**: `VideoCall/Canvas.tsx` opens a separate
  `ws://<api>/ws/session` connection scoped to a session ID.

## Payments (Razorpay)

`components/landing/Pricing.tsx` is the canonical flow:

1. `POST /subscriptions/checkout?planId=…` → backend creates a Razorpay order
   and a `PENDING` subscription row.
2. The page lazy-loads `checkout.razorpay.com/v1/checkout.js` and opens the
   checkout modal.
3. On success the page calls `POST /payment/verify` with `orderId`,
   `paymentId`, and `signature`. The backend verifies the HMAC and flips the
   subscription to `ACTIVE`.

## Conventions

- Toasts: always use `react-hot-toast` (`import toast from "react-hot-toast"`).
- Imports: prefer the `@/` alias (`tsconfig.json` maps `@/*` → `./src/*`).
- New UI primitives go in `components/ui/`. Feature components live in
  `components/<feature>/`.
- Keep secrets out of `NEXT_PUBLIC_*` variables — they ship to the browser.
