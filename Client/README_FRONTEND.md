# NerdsOnCall — Frontend

Next.js app for [NerdsOnCall](https://nerds-on-call.vercel.app/).

| | |
| --- | --- |
| **Production** | [https://nerds-on-call.vercel.app/](https://nerds-on-call.vercel.app/) |
| **API** | [https://nerdsoncall-api.shivam.app](https://nerdsoncall-api.shivam.app) |
| **Hosting** | Vercel |

## Stack

- **Next.js 15.5** (App Router), React 18, TypeScript
- Tailwind CSS v4
- TanStack Query v5, Axios, React Context
- Native **WebSocket** + **WebRTC** (browser APIs)
- **Groq** `llama-3.1-8b-instant` — only in `app/api/chat/route.ts` (REST, no Groq SDK)
- **Razorpay Checkout** via `checkout.razorpay.com/v1/checkout.js`
- `react-hot-toast`, `lucide-react`, Radix UI primitives
- `react-markdown` + `katex` for AI chat math

Not used: Socket.IO, STOMP, Stripe, OpenAI, Gemini.

## Run locally

```bash
cd Client
npm install
cp .env.example .env   # then edit
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If you see `ENOENT ... node_modules/buffer/index.js` after dependency changes:

```bash
npm run clean && npm run dev
```

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Browser (`lib/api.ts`, WebSocket URLs) | Backend base URL, **no trailing slash** |
| `GROQ_API_KEY` | Server only (`app/api/chat/route.ts`) | AI assistant |

**Local:**

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
GROQ_API_KEY=your_key_from_https://console.groq.com/keys
```

**Production (Vercel):**

```env
NEXT_PUBLIC_API_URL=https://nerdsoncall-api.shivam.app
GROQ_API_KEY=...
```

WebSockets: the app replaces `http` → `ws` / `https` → `wss` on that URL (`/ws/webrtc`, `/ws/session`).

## Deploy (Vercel)

1. Import repo; set **Root Directory** to `Client`
2. Framework preset: Next.js
3. Add env vars above for Production (and Preview if needed)
4. Deploy — requires **Next.js ≥ 15.5.18** (security patch; see `package.json`)

## Routes

```
app/
├── page.tsx, HomePageClient.tsx    # Landing
├── about/, features/, pricing/     # Marketing
├── auth/login|register|forgot-password/
├── reset-password/
├── dashboard/, profile/, profile/[id]/
├── browse-tutors/, select-tutor/, ask-question/
├── questions/, questions/ask/, questions/[id]/, questions/[id]/answer/
├── my-questions/, my-sessions/, my-students/
├── doubts/[id]/solve/
├── chat/                           # AI assistant UI
├── video-call/[sessionId]/
└── api/chat/route.ts               # Groq proxy (server-only)
```

## Source layout

```
src/
├── app/                  # Routes
├── components/           # ui/, layout/, landing/, VideoCall/, …
├── context/              # AuthContext, WebSocketContext
├── hooks/                # useChat, useDashboard, useTutorDashboard
├── lib/                  # api.ts, plans, currency, utils
├── types/
├── utils/errorMessages.ts
└── middleware.ts         # Cookie-based route guard
```

## Auth

JWT in `localStorage` + `token` cookie for `middleware.ts`.  
`lib/api.ts` sends `Authorization: Bearer …` and clears auth on `401` / expiry.

## Payments (Razorpay)

`components/landing/Pricing.tsx`:

1. `POST /subscriptions/checkout?planId=…`
2. Open Razorpay modal
3. `POST /payment/verify` with order/payment/signature

## Conventions

- Toasts: `react-hot-toast` only
- Imports: `@/` alias → `src/*`
- Never put secrets in `NEXT_PUBLIC_*`
