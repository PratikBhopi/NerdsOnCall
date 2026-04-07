package com.nerdsoncall.controller;

import com.nerdsoncall.entity.User;
import com.nerdsoncall.entity.TutorStatus;
import com.nerdsoncall.service.UserService;
import com.nerdsoncall.service.DashboardService;
import com.nerdsoncall.service.TutorStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private DashboardService dashboardService;
    
    @Autowired
    private TutorStatusService tutorStatusService;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get profile: " + e.getMessage());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@RequestBody User updateData, Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            User updatedUser = userService.updateUserProfile(user.getId(), updateData);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update profile: " + e.getMessage());
        }
    }

    @GetMapping("/tutors")
    public ResponseEntity<?> getAllTutors(@RequestParam(required = false) String subject) {
        try {
            List<User> tutors;
            if (subject != null) {
                User.Subject subjectEnum = User.Subject.valueOf(subject.toUpperCase());
                tutors = userService.findTutorsBySubject(subjectEnum);
            } else {
                tutors = userService.findAllTutors();
            }
            return ResponseEntity.ok(tutors);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get tutors: " + e.getMessage());
        }
    }

    @GetMapping("/tutors/online")
    public ResponseEntity<?> getOnlineTutors(@RequestParam(required = false) String subject) {
        try {
            List<User> tutors;
            if (subject != null) {
                User.Subject subjectEnum = User.Subject.valueOf(subject.toUpperCase());
                tutors = tutorStatusService.getOnlineTutorsBySubject(subjectEnum);
            } else {
                tutors = tutorStatusService.getOnlineTutors();
            }
            return ResponseEntity.ok(tutors);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get online tutors: " + e.getMessage());
        }
    }

    @GetMapping("/tutors/top-rated")
    public ResponseEntity<?> getTopRatedTutors(@RequestParam(required = false) String subject) {
        try {
            List<User> tutors;
            if (subject != null) {
                User.Subject subjectEnum = User.Subject.valueOf(subject.toUpperCase());
                tutors = userService.findTopRatedTutorsBySubject(subjectEnum);
            } else {
                tutors = userService.findTopRatedTutors();
            }
            return ResponseEntity.ok(tutors);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get top rated tutors: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get user: " + e.getMessage());
        }
    }

    @PutMapping("/online-status")
    public ResponseEntity<?> updateOnlineStatus(@RequestParam boolean isOnline, Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if user is a tutor
            if (user.getRole() != User.Role.TUTOR) {
                return ResponseEntity.badRequest().body("Only tutors can update online status");
            }
            
            // Update status in TutorStatus table
            TutorStatus.Status status = isOnline ? TutorStatus.Status.ONLINE : TutorStatus.Status.OFFLINE;
            TutorStatus tutorStatus = tutorStatusService.setTutorStatus(user.getId(), status);
            
            // Return user with updated status info
            Map<String, Object> response = Map.of(
                "user", user,
                "isOnline", tutorStatus.isOnline(),
                "status", tutorStatus.getStatus().toString(),
                "lastUpdated", tutorStatus.getLastUpdated()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update online status: " + e.getMessage());
        }
    }



    // Get user stats
    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getUserStats(@PathVariable Long id) {
        try {
            User user = userService.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> stats;
            if (user.getRole() == User.Role.TUTOR) {
                stats = dashboardService.getTutorDashboardStats(id);
            } else {
                stats = dashboardService.getStudentDashboardStats(id);
            }

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get user stats: " + e.getMessage());
        }
    }

    // Get user reviews (for tutors)
    @GetMapping("/{id}/reviews")
    public ResponseEntity<?> getUserReviews(@PathVariable Long id) {
        try {
            User user = userService.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // If user is not a tutor, return empty array instead of error
            if (user.getRole() != User.Role.TUTOR) {
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }

            // For now, return empty array - you can implement review service later
            return ResponseEntity.ok(new java.util.ArrayList<>());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get user reviews: " + e.getMessage());
        }
    }
}