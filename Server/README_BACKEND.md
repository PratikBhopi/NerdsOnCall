# NerdsOnCall Backend

Spring Boot service that powers the NerdsOnCall doubt-solving platform.

## Stack

- Java 17, Spring Boot 3.2.0
- Spring Web, Spring Security, Spring Data JPA, Spring WebSocket, Spring Mail
- PostgreSQL (JPA / Hibernate)
- JWT auth (`io.jsonwebtoken`)
- Razorpay Java SDK (payments + payouts)
- Cloudinary SDK (image / video uploads)
- iText 7 (PDF receipt generation)
- `me.paulschwarz:spring-dotenv` for `.env` loading

## Running locally

```bash
mvn spring-boot:run                       # default profile, uses Server/.env
mvn spring-boot:run -Dspring-boot.run.profiles=local   # uses application-local.yml
```

Server starts on `http://localhost:${PORT:8080}`. JPA runs with
`ddl-auto: update` by default and `create-drop` in the `local` profile.

## Configuration

| File | Purpose |
| --- | --- |
| `application.yml` | Main config; reads everything from env vars |
| `application-local.yml` | Convenience profile for local dev (`create-drop`) |
| `Server/.env` | Local environment variables (auto-loaded by `spring-dotenv`) |

See the root `README.md` for the full list of required environment variables.

## Database schema

JPA generates the schema from the entities in `com.nerdsoncall.entity`:

- `users` — students, tutors, admins (`role`); tutors have `bio`, `subjects`,
  `rating`, `hourlyRate`, `totalEarnings`, `razorpayContactId`.
- `doubts` — student-raised doubts (subject, title, description, priority,
  status, optional `preferredTutorId`).
- `sessions` — tutoring sessions linked to a doubt (and optionally direct
  call sessions). Tracks status, timing, cost, `tutorEarnings`, payment status.
- `subscriptions` — student plans tied to a Razorpay order. Status starts at
  `PENDING` and only flips to `ACTIVE` after payment signature verification.
- `feedbacks` — post-session ratings (1–5) and comments, in either direction.
- `payouts` — monthly tutor payouts grouped over a date range.
- Subscription plans are defined in code (`SubscriptionPlanCatalog`), not in
  the database. The legacy `plans` table is no longer used.
- `tutor_status` — tutor availability / online state.
- `common_questions` — public Q&A: student questions + tutor solutions (with
  optional Cloudinary-hosted video answer).

Hand-written SQL migrations live in `src/main/resources/db/migration/` for
columns that are added to existing tables outside JPA's reach.

## HTTP API

All endpoints are relative to the server base URL.

### Discovery

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Static landing page |
| GET | `/info`, `/welcome` | JSON service info and endpoint map |
| GET | `/health` | Liveness check |
| GET | `/health/db` | DB connectivity check |

### Auth (`AuthController`)

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/register` | Register a student or tutor |
| POST | `/auth/login` | Returns `{ token, user }` |
| GET  | `/auth/me` | Current authenticated user |
| POST | `/auth/forgot-password` | Email a reset link |
| POST | `/auth/reset-password` | Consume a reset token |

### Users / Tutors

| Method | Path | Description |
| --- | --- | --- |
| GET  | `/users/profile` | Current user profile |
| PUT  | `/users/profile` | Update profile |
| PUT  | `/users/online-status` | Update online flag |
| GET  | `/users/{id}` | User by ID |
| GET  | `/tutors/**` | Tutor discovery (online, top-rated, by subject) |

### Doubts

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/doubts` | Create a doubt |
| GET  | `/api/doubts/my-doubts` | Student's own doubts |
| GET  | `/api/doubts/available` | Open doubts for tutors |
| GET  | `/api/doubts/preferred` | Doubts where the tutor is preferred |
| GET  | `/api/doubts/{id}` | Get one doubt |
| PUT  | `/api/doubts/{id}/status` | Change status |

### Sessions

| Method | Path | Description |
| --- | --- | --- |
| POST | `/sessions` | Create a session |
| GET  | `/sessions/my-sessions` | User's sessions |
| GET  | `/sessions/{id}` | Get session |
| PUT  | `/sessions/{id}/end` | End and bill |
| PUT  | `/sessions/{id}/notes` | Update notes |
| PUT  | `/sessions/{id}/canvas` | Persist canvas snapshot |

### Plans, Subscriptions, Payments

| Method | Path | Description |
| --- | --- | --- |
| GET  | `/plans` | List active plans (public) |
| POST | `/subscriptions/checkout` | Create a Razorpay order (returns key, orderId, amount, etc.) |
| POST | `/payment/verify` | Verify Razorpay signature and activate subscription |
| GET  | `/subscriptions/my-subscription` | Current active subscription |
| GET  | `/subscriptions/history` | Subscription history |
| GET  | `/subscriptions/session-status` | Remaining sessions on current plan |
| GET  | `/subscriptions/can-create-session` | Boolean: can the student start a new session |
| POST | `/subscriptions/cancel/{id}` | Cancel a subscription |

### Feedback / Dashboard / Uploads / Q&A

| Method | Path | Description |
| --- | --- | --- |
| POST | `/feedback` | Submit feedback for a session |
| GET  | `/feedback/**` | Tutor / own feedback queries |
| GET  | `/dashboard/**` | Aggregated stats for tutor + student dashboards |
| POST | `/upload/**` | Cloudinary-backed file uploads |
| `/api/questions/**` | Public Q&A board |

### WebSocket endpoints

| Path | Handler | Purpose |
| --- | --- | --- |
| `/ws/webrtc?userId=...&sessionId=...` | `WebRTCSignalingHandler` | WebRTC offer/answer/ICE + presence |
| `/ws/session?userId=...&sessionId=...` | `TutoringSessionHandler` | Whiteboard, drawing events, screen share |

No STOMP, no SockJS, no Socket.IO — both endpoints are plain text WebSockets.

## Source layout

```
src/main/java/com/nerdsoncall
├── NerdsOnCallApplication.java   # entry point, @EnableAsync + @EnableScheduling
├── config/                       # Security, WebSocket, Cloudinary, DataSource
├── controller/                   # REST controllers
├── dto/                          # Request / response payloads
├── entity/                       # JPA entities
├── repository/                   # Spring Data repositories
├── scheduler/                    # @Scheduled jobs (payouts)
├── security/                     # JWT filter, entry point, util
├── service/                      # Business logic
└── websocket/                    # WebRTC + tutoring session handlers
```

## Scheduled jobs

- `SubscriptionSchedulerService.resetDailySessionUsage` — daily at 00:00
- `SubscriptionSchedulerService.processExpiredSubscriptions` — hourly
- `SubscriptionSchedulerService.cleanupOldExpiredSubscriptions` — daily at 02:00
- `SubscriptionSchedulerService.logSubscriptionStatistics` — daily at 01:00
- `PayoutScheduler.processMonthlyPayouts` — daily at 02:59 (stubbed payouts)

## Known limitations

- `RazorpayPayoutService` is a stub. Real Razorpay payout calls are commented
  out; `PayoutService.executePendingPayouts` uses dummy transaction IDs.
- Email and PDF templates are minimal; iText is used for receipts only.
- WebRTC uses public STUN only; production deployments will need a TURN
  server for users behind symmetric NATs.
