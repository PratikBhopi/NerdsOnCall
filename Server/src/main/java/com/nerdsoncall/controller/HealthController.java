package com.nerdsoncall.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "NerdsOnCall Backend");
        health.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(health);
    }

    @GetMapping("/db")
    public ResponseEntity<Map<String, Object>> databaseHealth() {
        Map<String, Object> dbHealth = new HashMap<>();
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(5)) {
                dbHealth.put("status", "UP");
                dbHealth.put("database", "PostgreSQL");
                dbHealth.put("connection", "HEALTHY");
                dbHealth.put("timestamp", System.currentTimeMillis());
                return ResponseEntity.ok(dbHealth);
            } else {
                dbHealth.put("status", "DOWN");
                dbHealth.put("database", "PostgreSQL");
                dbHealth.put("connection", "INVALID");
                dbHealth.put("timestamp", System.currentTimeMillis());
                return ResponseEntity.status(503).body(dbHealth);
            }
        } catch (Exception e) {
            dbHealth.put("status", "DOWN");
            dbHealth.put("database", "PostgreSQL");
            dbHealth.put("connection", "FAILED");
            dbHealth.put("error", e.getMessage());
            dbHealth.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(503).body(dbHealth);
        }
    }
} 