package com.nerdsoncall.controller;

import com.nerdsoncall.service.SubscriptionSchedulerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test")
@CrossOrigin(origins = "*")
public class SchedulerTestController {

    @Autowired
    private SubscriptionSchedulerService subscriptionSchedulerService;

    /**
     * Manual trigger for session reset - for testing purposes
     */

    @PostMapping("/reset-sessions")
    public ResponseEntity<?> manualResetSessions() {
        try {
            System.out.println("Manual trigger for session reset at: " + LocalDateTime.now());
            subscriptionSchedulerService.resetDailySessionUsage();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Session reset triggered manually");
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error during manual session reset: " + e.getMessage());
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Check scheduler status
     */
    @GetMapping("/scheduler-status")
    public ResponseEntity<?> getSchedulerStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("currentTime", LocalDateTime.now());
        response.put("schedulerEnabled", true);
        response.put("message", "Scheduler service is running");

        return ResponseEntity.ok(response);
    }

    /**
     * Test endpoint to verify the controller is working
     */
    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Test controller is working");
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity.ok(response);
    }
}
