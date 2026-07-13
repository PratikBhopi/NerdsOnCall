package com.nerdsoncall.controller;

import com.nerdsoncall.entity.User;
import com.nerdsoncall.service.UserService;
import com.nerdsoncall.service.TutorStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tutors")
@CrossOrigin(origins = "*")
public class TutorController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private TutorStatusService tutorStatusService;

    @GetMapping
    public ResponseEntity<?> getAllTutors(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "false") boolean onlineOnly) {
        
        try {
            List<User> tutors;
            
            // Filter by subject if provided
            if (subject != null && !subject.equalsIgnoreCase("all")) {
                try {
                    User.Subject subjectEnum = User.Subject.valueOf(subject.toUpperCase());
                    tutors = onlineOnly ? 
                        tutorStatusService.getOnlineTutorsBySubject(subjectEnum) : 
                        userService.findTopRatedTutorsBySubject(subjectEnum);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body("Invalid subject: " + subject);
                }
            } else {
                tutors = onlineOnly ? 
                    tutorStatusService.getOnlineTutors() : 
                    userService.findTopRatedTutors();
            }
            
            // Sort tutors based on sortBy parameter
            if (sortBy != null) {
                switch (sortBy.toLowerCase()) {
                    case "rating":
                        tutors = tutors.stream()
                            .sorted((a, b) -> Double.compare(b.getRating(), a.getRating()))
                            .collect(Collectors.toList());
                        break;
                    case "sessions":
                        tutors = tutors.stream()
                            .sorted((a, b) -> Integer.compare(b.getTotalSessions(), a.getTotalSessions()))
                            .collect(Collectors.toList());
                        break;
                    case "price_low":
                        tutors = tutors.stream()
                            .sorted((a, b) -> Double.compare(a.getHourlyRate(), b.getHourlyRate()))
                            .collect(Collectors.toList());
                        break;
                    case "price_high":
                        tutors = tutors.stream()
                            .sorted((a, b) -> Double.compare(b.getHourlyRate(), a.getHourlyRate()))
                            .collect(Collectors.toList());
                        break;
                    default:
                        // Default sort by rating
                        tutors = tutors.stream()
                            .sorted((a, b) -> Double.compare(b.getRating(), a.getRating()))
                            .collect(Collectors.toList());
                }
            }
            
            return ResponseEntity.ok(tutors);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get tutors: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTutorById(@PathVariable Long id) {
        try {
            User tutor = userService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));
            
            if (tutor.getRole() != User.Role.TUTOR) {
                return ResponseEntity.badRequest().body("User is not a tutor");
            }
            
            return ResponseEntity.ok(tutor);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get tutor: " + e.getMessage());
        }
    }

    @GetMapping("/subjects")
    public ResponseEntity<?> getAllSubjects() {
        try {
            // Return all available subjects
            return ResponseEntity.ok(User.Subject.values());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get subjects: " + e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getTutorStats() {
        try {
            // Count tutors by subject
            Map<User.Subject, Long> tutorsBySubject = userService.findTopRatedTutors().stream()
                .flatMap(tutor -> tutor.getSubjects().stream())
                .collect(Collectors.groupingBy(subject -> subject, Collectors.counting()));
            
            // Count online tutors
            long onlineTutorsCount = tutorStatusService.getOnlineTutorCount();
            
            // Create stats object
            Map<String, Object> stats = Map.of(
                "totalTutors", userService.findTopRatedTutors().size(),
                "onlineTutors", onlineTutorsCount,
                "tutorsBySubject", tutorsBySubject
            );
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get tutor stats: " + e.getMessage());
        }
    }
}