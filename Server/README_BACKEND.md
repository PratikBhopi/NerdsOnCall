# NerdsOnCall — Backend

Spring Boot API for [NerdsOnCall](https://nerds-on-call.vercel.app/).

| | |
| --- | --- |
| **Production** | [https://nerdsoncall-api.shivam.app](https://nerdsoncall-api.shivam.app) |
| **Health** | [GET /health](https://nerdsoncall-api.shivam.app/health) |
| **DB health** | [GET /health/db](https://nerdsoncall-api.shivam.app/health/db) |
| **Frontend (CORS / emails)** | [https://nerds-on-call.vercel.app](https://nerds-on-call.vercel.app) |

## Stack

- Java 17, Spring Boot 3.2
- Spring Web, Security, Data JPA, WebSocket, Mail
- **PostgreSQL** (JPA / Hibernate)
- JWT (`io.jsonwebtoken`)
- Razorpay Java SDK
- Cloudinary SDK
- iText 7 (PDF receipts)
- `spring-dotenv` → loads `Server/.env`

Not used: Supabase, Socket.IO, STOMP, MySQL, MongoDB.

## Run locally

```bash
cd Server
# Configure Server/.env (see .env.example)
mvn spring-boot:run
```

- API: [http://localhost:8080](http://localhost:8080)
- Profile `local`: `mvn spring-boot:run -Dspring-boot.run.profiles=local` (`application-local.yml`, `ddl-auto: create-drop`)

## Configuration

| File | Purpose |
| --- | --- |
| `application.yml` | Main config from environment variables |
| `application-local.yml` | Optional local dev profile |
| `Server/.env` | Secrets and URLs (git-ignored) |

### Required environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Listen port (default `8080`; Nginx proxies in production) |
| `FRONTEND_URL` | Frontend base URL (e.g. `https://nerds-on-call.vercel.app`) |
| `DB_URL` | `jdbc:postgresql://host:5432/dbname` |
| `DB_USERNAME`, `DB_PASSWORD` | PostgreSQL credentials |
| `JWT_SECRET` | Long random secret (production) |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | Gmail SMTP (app password) |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Media uploads |

Optional: `SPRING_PROFILES_ACTIVE=production`

## Production deployment (summary)

Typical layout on a VPS (e.g. Oracle Always Free):

1. PostgreSQL on the same machine (`localhost`)
2. `java -jar app.jar` via **systemd**, bound to `127.0.0.1:8080`
3. **Nginx** — HTTPS (Let's Encrypt), proxy `/` and `/ws/*` with WebSocket upgrade headers
4. Do **not** expose port 8080 publicly

Frontend on Vercel must use `NEXT_PUBLIC_API_URL=https://nerdsoncall-api.shivam.app` so REST and **WSS** work from an HTTPS page.

## HTTP API

Base URL: production host above, or `http://localhost:8080` locally.

### Discovery

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Static API landing page |
| GET | `/info`, `/welcome` | JSON service info |
| GET | `/health` | Liveness |
| GET | `/health/db` | PostgreSQL connectivity |

### Auth

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/register` | Register student or tutor |
| POST | `/auth/login` | `{ token, user }` |
| GET | `/auth/me` | Current user |
| POST | `/auth/forgot-password` | Email reset link |
| POST | `/auth/reset-password` | Complete reset |

### Core resources

| Area | Base path |
| --- | --- |
| Users / profile | `/users/*` |
| Tutors | `/tutors/*` |
| Doubts | `/api/doubts/*` |
| Sessions | `/sessions/*` |
| Plans | `/plans` |
| Subscriptions | `/subscriptions/*` |
| Payments | `/payment/*` |
| Q&A | `/api/questions/*` |
| Uploads | `/upload/*` |
| Dashboard | `/dashboard/*` |
| Feedback | `/feedback/*` |

### WebSockets

Plain text WebSockets (not STOMP / Socket.IO):

| Path | Handler | Purpose |
| --- | --- | --- |
| `/ws/webrtc?userId=…&sessionId=…` | `WebRTCSignalingHandler` | WebRTC signalling, chat, presence |
| `/ws/session?userId=…&sessionId=…` | `TutoringSessionHandler` | Whiteboard, drawing, screen share |

Production example: `wss://nerdsoncall-api.shivam.app/ws/webrtc?...`

## Database

JPA entities under `com.nerdsoncall.entity` — users, doubts, sessions, subscriptions, feedback, payouts, tutor status, common_questions.

- Subscription **plans** are defined in code (`SubscriptionPlanCatalog`), not a `plans` table.
- `ddl-auto: update` in production profile; SQL migrations in `src/main/resources/db/migration/` for manual column changes.

## Source layout

```
src/main/java/com/nerdsoncall/
├── NerdsOnCallApplication.java
├── config/          # Security, WebSocket, Cloudinary
├── controller/
├── dto/
├── entity/
├── repository/
├── scheduler/
├── security/
├── service/
└── websocket/
```

## Scheduled jobs

- Daily session usage reset
- Expired subscription processing
- Subscription cleanup / stats
- Monthly payout job (Razorpay payout integration partially stubbed)

## Known limitations

- `RazorpayPayoutService` — real payout API calls are stubbed in places
- WebRTC uses public STUN only; strict NATs may need a TURN server later
