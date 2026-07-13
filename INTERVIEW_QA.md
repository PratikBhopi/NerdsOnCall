# 🎓 NerdsOnCall - Technical Interview Q&A

This document contains a comprehensive breakdown of technical interview questions and professional answers regarding the architecture and engineering decisions behind the **NerdsOnCall** platform. 

---

## 📹 WebRTC Architecture

**Q1. Explain how WebRTC works — what happens from the moment two users connect?**
> When two users connect, there's a strict pipeline before video starts flowing. First, the browser requests media access (camera/mic). Then, the caller creates an **SDP Offer** (Session Description Protocol), which is basically a profile of supported codecs and resolutions. We send this offer through our signaling server to the receiver, who replies with an **SDP Answer**. Simultaneously, both peers use STUN servers to figure out their public IP addresses, generating **ICE Candidates**. These candidates are exchanged via the signaling server. Once the peers agree on a codec and find a valid network path, the `RTCPeerConnection` establishes a direct Peer-to-Peer (P2P) UDP connection, and the media stream begins bypassing the backend entirely.

**Q2. What is a STUN server? What is a TURN server? When do you need TURN?**
> A **STUN** (Session Traversal Utilities for NAT) server is essentially a mirror. Because users are behind local routers, they don't know their public IP. They ping the STUN server, which replies, "Here is the public IP and port I see you coming from."
> 
> However, if users are behind strict corporate firewalls (Symmetric NAT), STUN fails because the router blocks direct P2P traffic. That’s when we need a **TURN** (Traversal Using Relays around NAT) server. TURN acts as a cloud relay that actively proxies the video traffic between the users. It's a fallback, and we only use it when a direct P2P connection fails.

**Q3. How did you optimize STUN/TURN config to achieve ~120ms latency?**
> Achieving ~120ms latency comes down to aggressive ICE candidate gathering and avoiding TURN whenever possible. I configured the `RTCPeerConnection` to use a list of reliable, geographically distributed STUN servers (like Google's public STUNs) to quickly resolve public IPs. For TURN, I ensured the relay servers were deployed close to our target user base. Additionally, I prioritized UDP over TCP in the ICE transport policy, as UDP doesn't wait for packet acknowledgments, which is crucial for real-time media.

**Q4. What is signaling in WebRTC and how did you implement it?**
> Signaling is the process of introducing two peers before they can talk directly. WebRTC doesn't specify how signaling should happen. In NerdsOnCall, I implemented a custom WebSocket handler in our Spring Boot backend. It acts as a lightweight message broker that simply receives JSON payloads containing SDP offers/answers or ICE candidates from one user and routes them to the other user's active WebSocket session.

**Q5. What happens when both users are behind NAT? How does ICE handle that?**
> ICE (Interactive Connectivity Establishment) is the framework that solves this. When both users are behind NAT, ICE gathers all possible network paths: local IPs, public IPs (via STUN), and relay IPs (via TURN). Both peers exchange these candidate lists via our signaling server and then start aggressively pinging each other's addresses to find a route that can pierce the NATs. It tries the most direct route first (local, then STUN) and only falls back to the TURN relay if the direct hole-punching fails.

---

## ✏️ Socket.IO / Whiteboard Sync

**Q6. How does your whiteboard sync work? What events did you emit/listen to?**
> The whiteboard uses Socket.IO for real-time state synchronization. On the frontend, as a user draws, we capture the mouse coordinates and emit a `draw_event` payload containing `x, y, color, and strokeWidth`. The backend receives this and broadcasts it to the specific room (the session ID). The other client listens for the `draw_event` and renders those exact coordinates onto their HTML Canvas in real-time.

**Q7. How did you handle two users drawing at the exact same time?**
> For a 1-on-1 whiteboard, I relied on event queuing provided by Socket.IO and the single-threaded nature of the browser's event loop. When drawing events arrive concurrently, they are processed sequentially by the receiver's canvas context. Since both users are just painting pixels independently and not mutating a shared DOM tree, we didn't need heavy conflict resolution like Operational Transformation (OT) or CRDTs. It acts as a 'last-write-wins' at the pixel level.

**Q8. What's the difference between Socket.IO and plain WebSockets?**
> Plain WebSockets provide a raw, persistent, bi-directional TCP connection. Socket.IO is a library built *on top* of WebSockets. I chose Socket.IO for the whiteboard because it provides built-in features that plain WebSockets lack out of the box: automatic reconnections, broadcasting to specific 'rooms' (which is perfect for isolating separate tutoring sessions), and fallback to HTTP long-polling if WebSockets are blocked by a strict network.

**Q9. Why 80ms specifically — how did you measure whiteboard sync latency?**
> I measured the 80ms latency by tracking the round-trip time (RTT) of custom ping events over the Socket.IO connection and halving it to estimate one-way delivery. I also logged timestamps on the frontend when a `draw_event` was emitted, attached it to the payload, and compared it to `Date.now()` when the receiver rendered it. The ~80ms result is largely due to our backend being deployed close to the users and utilizing the lightweight WebSocket protocol.

**Q10. How would you scale this whiteboard to 100 concurrent users on the same board?**
> Currently, broadcasting every pixel coordinate for 100 users would choke the network. To scale, I would:
> 1. **Batching:** Instead of emitting an event for every mouse move, batch coordinates and emit them every 50ms.
> 2. **Vector Graphics / CRDTs:** Move from a pixel-based canvas to an SVG or object-based board (like Excalidraw) and implement CRDTs (Conflict-free Replicated Data Types) to resolve state conflicts gracefully.
> 3. **Redis Pub/Sub:** On the backend, scale horizontally by running multiple WebSocket server instances and using Redis Pub/Sub to route messages between users connected to different server nodes.

---

## 🔒 Auth & Security

**Q11. How does JWT authentication work? What's inside a JWT token?**
> JWT (JSON Web Token) allows us to do stateless authentication. After a user logs in, the backend signs a token and sends it back. A JWT has three parts: a Header (algorithm type), a Payload (claims), and a Signature. In NerdsOnCall, my payload contains the `userId`, their `role` (Student/Tutor), and the expiration time (`exp`). The backend just verifies the signature on subsequent requests to know who the user is without hitting the database.

**Q12. What is token blacklisting and why is it needed if JWTs are stateless?**
> Because JWTs are stateless, they are valid until they expire. If a user logs out or their account is compromised, we can't 'delete' the token from their browser remotely. Token blacklisting solves this. When a user logs out, we take their active JWT and store it in an in-memory database like Redis with a TTL matching the token's remaining lifespan. Our auth filter checks Redis first; if the token is there, the request is rejected, effectively invalidating the stateless token.

**Q13. How did you implement rate limiting — library or custom? Per user or per IP?**
> I implemented rate limiting to protect critical endpoints like login and WebRTC signaling from brute-force or DDoS attacks. This is typically done using an API Gateway or a library like Bucket4j in Spring Boot, using a Token Bucket algorithm. We limit primarily by **IP address** for unauthenticated routes (like login attempts) to prevent brute-forcing, and by **User ID** for authenticated routes to ensure fair usage of backend resources.

**Q14. What's the difference between authentication and authorization?**
> Authentication is answering "Who are you?" (e.g., verifying an email and password to issue a JWT). Authorization is answering "What are you allowed to do?" (e.g., Role-Based Access Control). In our app, once authenticated, our Spring Security setup handles authorization by checking the role embedded in the JWT to ensure, for instance, that a Student cannot access the Tutor-only dashboard.

---

## 🐳 Docker & Deployment

**Q15. Why did you containerize this app? What problem does Docker solve?**
> Docker solves the "it works on my machine" problem. By containerizing the Next.js frontend, Spring Boot backend, and PostgreSQL database, I ensured that the application runs in identical environments across development, testing, and production. It abstracts away OS-level dependency mismatches (like different Java or Node versions) and makes deployments predictable and scalable.

**Q16. How did you write your Dockerfile? What's a multi-stage build?**
> For the backend and frontend, I used **multi-stage builds**. This means the Dockerfile has two distinct phases. Phase one uses a heavy image (like `maven` or `node`) to download dependencies and compile/build the source code. Phase two uses a very lightweight runtime image (like `openjdk:17-alpine` or `node:alpine`), copies *only* the compiled artifacts from phase one, and discards all the heavy build tools. This drastically reduced our final image sizes and improved security by minimizing the attack surface.

**Q17. Did you use docker-compose? How did you wire the backend, DB, and frontend together?**
> Yes, `docker-compose` is essential for orchestrating the stack locally. I defined three services: `db`, `backend`, and `frontend`. I wired them together using Docker's internal DNS network. For example, instead of configuring the backend to connect to `localhost:5432`, I pointed it to `jdbc:postgresql://db:5432`. I also used environment variables injected via the `docker-compose.yml` and `depends_on` rules to ensure the database container was fully initialized before the backend attempted to connect.
