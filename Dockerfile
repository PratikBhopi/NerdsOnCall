# ============================================
# NerdsOnCall - Full Stack Docker Image
# Contains: Frontend (Next.js) + Backend (Spring Boot) + PostgreSQL
# Just run: docker run -p 3000:3000 -p 8080:8080 your-image-name
# ============================================

# ==================== STAGE 1: Build Frontend ====================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY Client/package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy frontend source
COPY Client/ ./

# Set the API URL to the local backend (will be on same container)
ENV NEXT_PUBLIC_API_URL=http://localhost:8080

# Build Next.js for production
RUN npm run build

# ==================== STAGE 2: Build Backend ====================
FROM maven:3.9-eclipse-temurin-17-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend pom.xml first for dependency caching
COPY Server/pom.xml ./

# Download dependencies (cached layer)
RUN mvn dependency:go-offline -B

# Copy backend source
COPY Server/src ./src

# Create .env file for spring-dotenv (required at runtime)
RUN echo "# Docker Environment Variables" > ./src/main/resources/.env && \
    echo "DB_URL=jdbc:postgresql://localhost:5432/nerdsoncall_db" >> ./src/main/resources/.env && \
    echo "DB_USERNAME=nerds" >> ./src/main/resources/.env && \
    echo "DB_PASSWORD=nerds123" >> ./src/main/resources/.env && \
    echo "PORT=8080" >> ./src/main/resources/.env && \
    echo "JWT_SECRET=your_jwt_secret_key_should_be_at_least_256_bits_long_for_security_purposes_in_production" >> ./src/main/resources/.env && \
    echo "MAIL_USERNAME=demo@example.com" >> ./src/main/resources/.env && \
    echo "MAIL_PASSWORD=demo" >> ./src/main/resources/.env && \
    echo "RAZORPAY_KEY_ID=rzp_test_demo" >> ./src/main/resources/.env && \
    echo "RAZORPAY_KEY_SECRET=demo_secret" >> ./src/main/resources/.env && \
    echo "CLOUDINARY_CLOUD_NAME=demo" >> ./src/main/resources/.env && \
    echo "CLOUDINARY_API_KEY=demo" >> ./src/main/resources/.env && \
    echo "CLOUDINARY_API_SECRET=demo" >> ./src/main/resources/.env && \
    echo "FRONTEND_URL=http://localhost:3000" >> ./src/main/resources/.env

# Build the Spring Boot JAR (skip tests for faster build)
RUN mvn clean package -DskipTests -B

# ==================== STAGE 3: Final Runtime Image (Alpine = smaller!) ====================
FROM alpine:3.19

# Install required packages (Alpine uses apk, not apt)
RUN apk add --no-cache \
    openjdk17-jre-headless \
    nodejs \
    npm \
    postgresql \
    postgresql-contrib \
    supervisor \
    curl \
    bash

# Create app directory
WORKDIR /app

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/.next ./.next
COPY --from=frontend-builder /app/frontend/public ./public
COPY --from=frontend-builder /app/frontend/package*.json ./
COPY --from=frontend-builder /app/frontend/node_modules ./node_modules
COPY --from=frontend-builder /app/frontend/next.config.js ./

# Copy built backend JAR from stage 2
COPY --from=backend-builder /app/backend/target/*.jar ./backend.jar

# ==================== PostgreSQL Setup (Alpine) ====================
RUN mkdir -p /var/lib/postgresql/data /run/postgresql && \
    chown -R postgres:postgres /var/lib/postgresql /run/postgresql

USER postgres
RUN initdb -D /var/lib/postgresql/data && \
    pg_ctl -D /var/lib/postgresql/data start && \
    psql --command "CREATE USER nerds WITH SUPERUSER PASSWORD 'nerds123';" && \
    createdb -O nerds nerdsoncall_db && \
    pg_ctl -D /var/lib/postgresql/data stop

USER root

# Configure PostgreSQL to accept connections
RUN echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf && \
    echo "listen_addresses='*'" >> /var/lib/postgresql/data/postgresql.conf

# ==================== Supervisor Configuration ====================
# Supervisor will manage all three services
RUN mkdir -p /var/log/supervisor

COPY <<EOF /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:postgresql]
command=/usr/bin/postgres -D /var/lib/postgresql/data
user=postgres
autostart=true
autorestart=true
priority=1
stdout_logfile=/var/log/supervisor/postgresql.log
stderr_logfile=/var/log/supervisor/postgresql_err.log

[program:backend]
command=java -jar /app/backend.jar
directory=/app
autostart=true
autorestart=true
priority=10
startsecs=10
startretries=3
stdout_logfile=/var/log/supervisor/backend.log
stderr_logfile=/var/log/supervisor/backend_err.log
environment=SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/nerdsoncall_db",SPRING_DATASOURCE_USERNAME="nerds",SPRING_DATASOURCE_PASSWORD="nerds123",PORT="8080",JWT_SECRET="your_jwt_secret_key_should_be_at_least_256_bits_long_for_security_purposes_in_production",MAIL_USERNAME="demo@example.com",MAIL_PASSWORD="demo",RAZORPAY_KEY_ID="rzp_test_demo",RAZORPAY_KEY_SECRET="demo_secret",CLOUDINARY_CLOUD_NAME="demo",CLOUDINARY_API_KEY="demo",CLOUDINARY_API_SECRET="demo",FRONTEND_URL="http://localhost:3000"

[program:frontend]
command=npm start
directory=/app
autostart=true
autorestart=true
priority=20
startsecs=5
stdout_logfile=/var/log/supervisor/frontend.log
stderr_logfile=/var/log/supervisor/frontend_err.log
environment=NEXT_PUBLIC_API_URL="http://localhost:8080",PORT="3000"
EOF

# Expose ports
EXPOSE 3000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000 && curl -f http://localhost:8080/api/health || exit 1

# Start all services
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]