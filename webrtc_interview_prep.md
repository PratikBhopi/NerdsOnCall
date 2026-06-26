# The WebRTC Video Pipeline Architecture (NerdsOnCall Project)

In your application, you are using a **Peer-to-Peer (P2P) Mesh Architecture** using standard WebRTC APIs. Here is the step-by-step pipeline of how a video call is established:

1. **Media Acquisition:** The client browser requests access to the user's camera and microphone using the `navigator.mediaDevices.getUserMedia()` API.
2. **Signaling (The Introducer):** Before two peers can send video to each other, they need to know *how* to connect. Your app uses a WebSocket server (`/ws/webrtc`) as a "Signaling Server". This server does **not** touch the video; it only relays setup messages between the tutor and the student.
3. **The Handshake (SDP Exchange):** 
   - The Caller creates an **Offer** using **SDP** (Session Description Protocol), which is essentially a list of supported video resolutions and codecs. This is sent to the receiver via the WebSocket.
   - The Receiver gets the Offer, creates an **Answer**, and sends it back.
4. **NAT Traversal (ICE Candidates):** Because users are usually behind routers (NATs), they don't know their own public IP addresses. WebRTC uses **STUN** servers to find their public IPs. It generates **ICE Candidates** (potential network routes) and exchanges them over the WebSocket.
5. **Direct P2P Connection:** Once the IPs and codecs are agreed upon, the `RTCPeerConnection` successfully establishes a direct, secure path between the two browsers.
6. **Media Flow:** The video and audio tracks are injected into the connection, flowing directly between the two users over UDP, completely bypassing your backend server for zero-latency communication.

***

## Technical Interview Questions & Answers

Here are professional interview questions formulated around your specific project architecture, with clear, fundamental answers.

### Q1: Explain the fundamental difference between WebSockets and WebRTC in the context of your video calling application.
**Answer:** "In our application, we use both, but for completely different purposes. WebSockets use a client-server architecture over TCP, which guarantees reliable, ordered data delivery. We use WebSockets strictly for **Signaling**—passing text-based setup messages like chat, incoming call notifications, and connection data. 
WebRTC, on the other hand, establishes a direct **Peer-to-Peer (P2P)** connection, primarily over UDP. It is optimized for ultra-low latency media streaming where speed is prioritized over reliability (dropping a video frame is better than delaying the entire stream)."

### Q2: What is the role of the Signaling Server in your WebRTC pipeline, and why doesn't it handle the video streams?
**Answer:** "The Signaling Server acts as a central broker to introduce the two clients. It relays critical connection metadata (SDP offers/answers and ICE candidates) so the peers know how to find and talk to each other. It doesn't handle the video streams because routing heavy video data through a central server would introduce unnecessary latency, require massive bandwidth, and defeat the purpose of WebRTC's decentralized P2P architecture."

### Q3: Can you explain what SDP (Session Description Protocol) is and how it is used in your call flow?
**Answer:** "SDP acts like a 'media resume' for the browsers. When a user initiates a call, their `RTCPeerConnection` generates an SDP **Offer** detailing their supported video codecs (like VP8 or H.264), audio formats, and network parameters. The receiving peer parses this and replies with an SDP **Answer**, indicating what formats they can accept. We exchange these strings over our WebSocket so both peers can agree on a common media language before sending any video."

### Q4: Users are often behind strict routers or firewalls. How does your WebRTC architecture connect them?
**Answer:** "WebRTC handles this using the **ICE (Interactive Connectivity Establishment)** framework. First, it queries a **STUN server**, which essentially acts as a mirror, telling the browser what its public IP address is. If a direct P2P connection fails because a user is behind a highly restrictive corporate firewall (Symmetric NAT), WebRTC falls back to a **TURN server**. A TURN server acts as a cloud relay that actively passes the media streams between the users when P2P is impossible."

### Q5: In your architecture, what are ICE candidates and why do we exchange them?
**Answer:** "An ICE candidate is simply a potential network pathway (an IP address and port combination) through which a peer can be reached. Because devices have local network IPs, public IPs, and sometimes relay IPs, WebRTC gathers all possible connection points. We exchange these candidates through our signaling WebSocket so that the two peers can aggressively test them and lock in the fastest, most reliable path for the video stream."

### Q6: Why did you choose a Peer-to-Peer `RTCPeerConnection` architecture instead of a centralized media server (like an SFU)?
**Answer:** "Our platform primarily focuses on 1-on-1 tutoring sessions. For exactly two participants, a P2P mesh architecture is the most efficient and cost-effective approach. It provides the lowest possible latency by connecting the users directly, and it requires zero video-processing infrastructure on our backend. If our business requirements evolve to support large group classrooms (e.g., 10+ people), we would need to migrate to an SFU (Selective Forwarding Unit) architecture to reduce the bandwidth load on the clients."
