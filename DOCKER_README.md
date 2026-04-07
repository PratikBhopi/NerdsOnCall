# 🚀 NerdsOnCall - Docker Quick Start

## For Teachers/Reviewers

### **Run the Application (One Command!)**

```bash
docker run -p 3000:3000 -p 8080:8080 kingshivamx/nerdsoncall:latest
```

Wait ~30 seconds for all services to start, then open:
- **🌐 Frontend**: http://localhost:3000
- **⚙️ Backend API**: http://localhost:8080

That's it! No environment variables, no database setup, no additional configuration needed.

---

## What's Inside the Container?

This Docker image contains a complete full-stack application:

| Component | Technology | Port |
|-----------|------------|------|
| Frontend | Next.js 15 (React) | 3000 |
| Backend | Spring Boot 3.2 (Java 17) | 8080 |
| Database | PostgreSQL 14 | 5432 (internal) |

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Docker Container                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Next.js   │──│ Spring Boot │──│   PostgreSQL    │  │
│  │  Port 3000  │  │  Port 8080  │  │   Port 5432     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## About the Project

**NerdsOnCall** is a Real-Time Doubt-Solving Platform that connects students with tutors for instant academic help.

### Key Features:
- 🔐 User Authentication (JWT-based)
- 💬 Real-time WebSocket Communication
- 📹 Video Call Support (WebRTC)
- 💳 Payment Integration (Razorpay)
- 📧 Email Notifications
- 📁 File Upload (Cloudinary)

---

## For Developers

### Building the Image Locally

```bash
# Clone the repository
git clone <repository-url>
cd NerdsOnCall

# Build the Docker image
docker build -t nerdsoncall:local .

# Run the container
docker run -p 3000:3000 -p 8080:8080 nerdsoncall:local
```

### Pushing to DockerHub

```bash
# Login to DockerHub
docker login

# Tag the image
docker tag nerdsoncall:local kingshivamx/nerdsoncall:latest

# Push to DockerHub
docker push kingshivamx/nerdsoncall:latest
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Container exits immediately | Check logs: `docker logs <container_id>` |
| Port already in use | Stop other services using ports 3000 or 8080 |
| Slow startup | Wait 60 seconds for PostgreSQL and Spring Boot to initialize |

### View Logs
```bash
# Find container ID
docker ps

# View all logs
docker logs -f <container_id>

# View specific service logs (inside container)
docker exec -it <container_id> cat /var/log/supervisor/backend.log
docker exec -it <container_id> cat /var/log/supervisor/frontend.log
```

---

## Team

Built with ❤️ by the NerdsOnCall Team

---

*Last Updated: January 2026*
