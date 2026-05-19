package com.nerdsoncall.controller;

import com.nerdsoncall.dto.ForgotPasswordRequest;
import com.nerdsoncall.dto.LoginRequest;
import com.nerdsoncall.dto.LoginResponse;
import com.nerdsoncall.dto.RegisterRequest;
import com.nerdsoncall.dto.ResetPasswordRequest;
import com.nerdsoncall.entity.User;
import com.nerdsoncall.service.AuthService;
import com.nerdsoncall.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            System.out.println("Registration request received: " + request);
            
            // Basic validation
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }
            if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("First name is required");
            }
            if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Last name is required");
            }
            if (request.getRole() == null) {
                return ResponseEntity.badRequest().body("Role is required");
            }
            
            System.out.println("Role: " + request.getRole());
            System.out.println("Email: " + request.getEmail());
            System.out.println("First Name: " + request.getFirstName());
            System.out.println("Last Name: " + request.getLastName());
            
            // Validate tutor-specific fields
            if (request.getRole() == User.Role.TUTOR) {
                System.out.println("Validating tutor fields...");
                System.out.println("Bio: " + request.getBio());
                System.out.println("Subjects: " + request.getSubjects());

                if (request.getBio() == null || request.getBio().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body("Bio is required for tutors");
                }
                if (request.getSubjects() == null || request.getSubjects().isEmpty()) {
                    return ResponseEntity.badRequest().body("At least one subject is required for tutors");
                }
            }

            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setRole(request.getRole());
            user.setPhoneNumber(request.getPhoneNumber());

            if (request.getRole() == User.Role.TUTOR) {
                user.setBio(request.getBio());
                user.setSubjects(request.getSubjects());
                // Set fixed hourly rate for all tutors
                user.setHourlyRate(50.0);
            }

            User savedUser = authService.register(user);
            String token = authService.generateTokenForUser(savedUser);
            
            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setUser(savedUser);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            String token = authService.login(request.getEmail(), request.getPassword());
            User user = userService.findByEmail(request.getEmail()).orElse(null);
            
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setUser(user);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String message = e.getMessage();
            if (message.contains("Bad credentials")) {
                return ResponseEntity.badRequest().body("Invalid email or password");
            }
            return ResponseEntity.badRequest().body(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Login failed: " + e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication authentication) {
        try {
            if (authentication != null) {
                authService.logout(authentication.getName());
            }
            return ResponseEntity.ok("Logged out successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Logout failed: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName()).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to get user: " + e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            authService.forgotPassword(request.getEmail());
            return ResponseEntity.ok("If an account with that email exists, a password reset link has been sent.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to process forgot password request: " + e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            boolean success = authService.resetPassword(request.getToken(), request.getNewPassword());
            if (success) {
                return ResponseEntity.ok("Password has been reset successfully.");
            } else {
                return ResponseEntity.badRequest().body("Invalid or expired reset token.");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to reset password: " + e.getMessage());
        }
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        try {
            boolean isValid = authService.validateResetToken(token);
            if (isValid) {
                return ResponseEntity.ok("Token is valid.");
            } else {
                return ResponseEntity.badRequest().body("Invalid or expired token.");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to validate token: " + e.getMessage());
        }
    }
} 