package com.nerdsoncall.controller;

import com.nerdsoncall.entity.User;
import com.nerdsoncall.service.DashboardService;
import com.nerdsoncall.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private UserService userService;

    // Get student dashboard statistics
    @GetMapping("/student")
    public ResponseEntity<?> getStudentDashboard(Authentication authentication) {
        try {
            System.out.println("Dashboard request from: " + authentication.getName());
            
            User user = userService.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("User found: " + user.getFirstName() + " " + user.getLastName() + " (Role: " + user.getRole() + ")");

            if (user.getRole() != User.Role.STUDENT) {
                return ResponseEntity.badRequest().body("Only students can access student dashboard");
            }

            Map<String, Object> dashboardData = dashboardService.getStudentDashboardStats(user.getId());
            System.out.println("Dashboard data fetched successfully");
            
            return ResponseEntity.ok(dashboardData);
            
        } catch (Exception e) {
            System.err.println("Error fetching student dashboard: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to fetch dashboard data: " + e.getMessage());
        }
    }

    // Get tutor dashboard statistics
    @GetMapping("/tutor")
    public ResponseEntity<?> getTutorDashboard(Authentication authentication) {
        try {
            System.out.println("Tutor dashboard request from: " + authentication.getName());

            User user = userService.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("User found: " + user.getFirstName() + " " + user.getLastName() + " (Role: " + user.getRole() + ")");

            if (user.getRole() != User.Role.TUTOR) {
                return ResponseEntity.badRequest().body("Only tutors can access tutor dashboard");
            }

            Map<String, Object> dashboardData = dashboardService.getTutorDashboardStats(user.getId());
            System.out.println("Tutor dashboard data fetched successfully");

            return ResponseEntity.ok(dashboardData);

        } catch (Exception e) {
            System.err.println("Error fetching tutor dashboard: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to fetch tutor dashboard data: " + e.getMessage());
        }
    }

    // Get dashboard statistics for any user (for testing)
    @GetMapping("/stats/{userId}")
    public ResponseEntity<?> getDashboardStats(@PathVariable Long userId) {
        try {
            System.out.println("Dashboard stats request for user ID: " + userId);
            
            Map<String, Object> dashboardData = dashboardService.getStudentDashboardStats(userId);
            System.out.println("Dashboard stats fetched successfully");
            
            return ResponseEntity.ok(dashboardData);
            
        } catch (Exception e) {
            System.err.println("Error fetching dashboard stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to fetch dashboard stats: " + e.getMessage());
        }
    }
}
