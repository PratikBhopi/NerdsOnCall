<div align="center">
  <h1>🎓 NerdsOnCall</h1>
  <p><strong>A Real-Time, Peer-to-Peer Educational Platform for Instant Doubt Resolution</strong></p>

  [![Next.js](https://img.shields.io/badge/Frontend-Next.js_15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Spring Boot](https://img.shields.io/badge/Backend-Spring_Boot_3-6DB33F?style=for-the-badge&logo=spring)](https://spring.io/projects/spring-boot)
  [![WebRTC](https://img.shields.io/badge/Real_Time-WebRTC-333333?style=for-the-badge&logo=webrtc)](https://webrtc.org/)
  [![Docker](https://img.shields.io/badge/Deployment-Docker-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
</div>

<br />

**NerdsOnCall** is a full-stack educational platform designed to connect students with expert tutors instantly. It leverages WebRTC for zero-latency peer-to-peer video sessions and Socket.IO for highly synchronized interactive whiteboards, providing an immersive remote learning experience.

---

## ✨ Core Features

*   🎥 **Ultra-Low Latency Video Calling:** Peer-to-peer 1-on-1 video and audio powered by WebRTC (avg. ~120ms latency).
*   ✏️ **Real-Time Interactive Whiteboard:** Synchronized drawing using Socket.IO (avg. ~80ms latency) for visual problem solving.
*   💬 **Instant Chat & Notifications:** Real-time messaging and call notifications orchestrated via WebSockets and STOMP.
*   🔒 **Robust Security & RBAC:** Stateless JWT authentication with token blacklisting, and strict Role-Based Access Control (Student vs. Tutor).
*   💳 **Automated Subscriptions:** Payment gateway integration with secure webhook handling for subscription provisioning.
*   🐳 **Containerized Deployment:** Multi-stage Docker builds for consistent, scalable environments across frontend and backend.

## 🏗️ Architecture Overview

The system is decoupled into a robust Java Spring Boot backend and a modern Next.js frontend.

### WebRTC Pipeline (P2P Mesh)
Instead of routing heavy video traffic through a central server, the backend acts purely as a **Signaling Server**. It introduces peers by relaying SDP (Session Description Protocol) offers/answers and ICE candidates over WebSockets. Once the negotiation completes, the clients establish a secure, direct UDP connection for video streaming, ensuring minimum latency and lowering server bandwidth costs.

### Real-Time Sync & State
The interactive whiteboard relies on **Socket.IO** for event-based broadcasting (`draw_event`). It utilizes the browser's event loop to resolve conflicting strokes sequentially, providing a smooth collaborative experience without the need for complex Operational Transformations for 1-on-1 sessions.

---

## 🛠️ Technology Stack

### Frontend (Client)
*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4
*   **State Management:** React Context + TanStack Query v5
*   **Real-Time:** WebRTC (Simple Peer) & Socket.IO Client

### Backend (Server)
*   **Framework:** Spring Boot 3.2.0 (Java 17)
*   **Database:** PostgreSQL (via Supabase) with Spring Data JPA
*   **Security:** Spring Security + custom JWT Filters
*   **Real-Time:** WebSockets (STOMP) & Custom Signaling Handlers
*   **Background Jobs:** Spring `@Scheduled` Cron Jobs

### Infrastructure
*   **Containerization:** Docker & Docker Compose

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/en/) 18+
*   [Java](https://adoptium.net/) 17+
*   [Docker](https://www.docker.com/) (Optional, for containerized running)
*   PostgreSQL Database

### Option 1: Local Native Setup

**1. Backend Initialization**
```bash
cd Server
# Configure your application.yml / .env with DB and Gateway credentials
mvn clean install
mvn spring-boot:run
```
*The server will start on `http://localhost:8080`*

**2. Frontend Initialization**
```bash
cd Client
npm install
# Configure your .env.local variables
npm run dev
```
*The client application will be available at `http://localhost:3000`*

### Option 2: Docker Setup
Ensure Docker Desktop is running, then use `docker-compose` at the root of the project to spin up the Database, Backend, and Frontend simultaneously.

```bash
docker-compose up --build
```

---

## 🔒 Security Practices
*   **Stateless Authentication:** User roles are embedded in JWT payloads to eliminate database checks on every request.
*   **Token Blacklisting:** Handled securely on logout to invalidate active tokens.
*   **Rate Limiting:** Protects critical endpoints like login and WebRTC signaling from brute-force attacks.
*   **Webhook Verification:** Payment events are cryptographically verified to prevent fraudulent subscription provisioning.

## 👨‍💻 Developed By
**Pratik Bhopi** - *Full Stack Developer*
