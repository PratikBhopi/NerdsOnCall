package com.nerdsoncall.controller;

import com.nerdsoncall.entity.Session;
import com.nerdsoncall.entity.User;
import com.nerdsoncall.service.SessionService;
import com.nerdsoncall.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class SessionController {

    @Autowired
    private SessionService sessionService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> createSession(@RequestParam Long tutorId, @RequestParam Long doubtId,
            Authentication authentication) {
        try {
            User student = userService.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (student.getRole() != User.Role.STUDENT) {
                return ResponseEntity.badRequest().body("Only students can create sessions");
            }

            Session session = sessionService.createSession(student.getId(), tutorId, doubtId);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create session: " + e.getMessage());
        }
    }

    // New endpoint for creating call-based sessions
    @PostMapping("/call")
    public ResponseEntity<?> createCallSession(@RequestParam Long tutorId, @RequestParam String sessionId,
            Authentication authentication) {
        try {
            System.out.println(" Creating call session - TutorId: " + tutorId + ", SessionId: " + sessionId);

            User currentUser = userService.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("Current user: " + currentUser.getFirstName() + " " + currentUser.getLastName() + " (ID: " + currentUser.getId() + ", Role: " + currentUser.getRole() + ")");

            Long studentId;
            Long actualTutorId;

            if (currentUser.getRole() == User.Role.STUDENT) {
                // Student is creating the session
                studentId = currentUser.getId();
                actualTutorId = tutorId;
                System.out.println("Student creating session with tutor ID: " + tutorId);
            } else if (currentUser.getRole() == User.Role.TUTOR) {
                // Tutor is creating the session - they are the tutor, tutorId param is actually studentId
                studentId = tutorId; // The tutorId parameter is actually the student ID when tutor creates
                actualTutorId = currentUser.getId();
                System.out.println("Tutor creating session with student ID: " + tutorId);
            } else {
                System.out.println("Invalid user role: " + currentUser.getRole());
                return ResponseEntity.badRequest().body("Invalid user role for session creation");
            }

            Session session = sessionService.createCallSession(studentId, actualTutorId, sessionId);
            System.out.println("Call session created successfully with ID: " + session.getId());
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            System.err.println("Failed to create call session: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to create call session: " + e.getMessage());
        }
    }

    // Start call session by sessionId (for video calls)
    @PutMapping("/call/{sessionId}/start")
    public ResponseEntity<?> startCallSession(@PathVariable String sessionId) {
        try {
            System.out.println("Starting call session: " + sessionId);
            Session session = sessionService.startCallSession(sessionId);
            System.out.println("Call session started successfully: " + sessionId);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            System.err.println("Failed to start call session: " + sessionId + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to start call session: " + e.getMessage());
        }
    }

    // End call session by sessionId (for video calls)
    @PutMapping("/call/{sessionId}/end")
    public ResponseEntity<?> endCallSession(@PathVariable String sessionId) {
        try {
            Session session = sessionService.endCallSession(sessionId);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to end call session: " + e.getMessage());
        }
    }

    // Cancel call session by sessionId (for declined calls)
    @PutMapping("/call/{sessionId}/cancel")
    public ResponseEntity<?> cancelCallSession(@PathVariable String sessionId, @RequestParam(required = false) String reason) {
        try {
            System.out.println("Cancelling call session: " + sessionId + " - Reason: " + reason);
            Session session = sessionService.cancelCallSession(sessionId, reason != null ? reason : "Call declined");
            System.out.println("Call session cancelled successfully: " + sessionId);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            System.err.println("Failed to cancel call session: " + sessionId + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to cancel call session: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<?> startSession(@PathVariable Long id) {
        try {
            Session session = sessionService.startSession(id);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to start session: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<?> endSession(@PathVariable Long id) {
        try {
            Session session = sessionService.endSession(id);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to end session: " + e.getMessage());
        }
    }

    @GetMapping("/my-sessions")
    public ResponseEntity<?> getMySessions(Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Session> sessions;
            if (user.getRole() == User.Role.STUDENT) {
                sessions = sessionService.getSessionsByStudent(user.getId());
            } else if (user.getRole() == User.Role.TUTOR) {
                sessions = sessionService.getSessionsByTutor(user.getId());
            } else {
                return ResponseEntity.badRequest().body("Invalid user role");
            }

            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get sessions: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSessionById(@PathVariable Long id) {
        try {
            Session session = sessionService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get session: " + e.getMessage());
        }
    }

    @GetMapping("/doubt/{doubtId}")
    public ResponseEntity<?> getSessionByDoubtId(@PathVariable Long doubtId) {
        try {
            Session session = sessionService.findByDoubtId(doubtId)
                    .orElse(null);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get session: " + e.getMessage());
        }
    }

    // Health check endpoint for session functionality
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        try {
            long sessionCount = sessionService.getSessionCount();
            return ResponseEntity.ok("Session service healthy. Total sessions: " + sessionCount);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Session service unhealthy: " + e.getMessage());
        }
    }

    // Database update endpoint for adding actual_start_time column
    @PostMapping("/update-schema")
    public ResponseEntity<String> updateSchema() {
        try {
            sessionService.updateDatabaseSchema();
            return ResponseEntity.ok("Database schema updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to update schema: " + e.getMessage());
        }
    }
}