package com.nerdsoncall.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Arrays;

@RestController
public class WelcomeController {

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getApiInfo() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "NerdsOnCall Backend API");
        response.put("version", "1.0.0");
        response.put("status", "Running");
        response.put("timestamp", LocalDateTime.now());
        response.put("description", "Real-Time Doubt-Solving Platform Backend");

        Map<String, Object> endpoints = new HashMap<>();
        endpoints.put("health", "/health");
        endpoints.put("authentication", "/auth/*");
        endpoints.put("users", "/users/*");
        endpoints.put("tutors", "/tutors/*");
        endpoints.put("sessions", "/sessions/*");
        endpoints.put("doubts", "/doubts/*");
        endpoints.put("questions", "/api/questions/*");
        endpoints.put("plans", "/plans/*");
        endpoints.put("subscriptions", "/subscriptions/*");
        endpoints.put("payment", "/payment/*");
        endpoints.put("feedback", "/feedback/*");
        endpoints.put("dashboard", "/dashboard/*");
        endpoints.put("uploads", "/upload/*");
        endpoints.put("websocket-webrtc", "/ws/webrtc");
        endpoints.put("websocket-session", "/ws/session");

        response.put("available_endpoints", endpoints);
        response.put("documentation", "GET /health for service status");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/welcome")
    public ResponseEntity<Map<String, Object>> welcome() {
        return getApiInfo();
    }
}