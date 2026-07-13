package com.nerdsoncall.service;

import com.nerdsoncall.entity.User;
import com.nerdsoncall.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private TutorStatusService tutorStatusService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public String login(String email, String password) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, password)
        );

        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
    }

    public User register(User user) {
        return userService.createUser(user);
    }

    public void logout(String email) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() == User.Role.TUTOR) {
            tutorStatusService.setTutorOnline(user.getId(), false);
        } else {
            userService.updateOnlineStatus(user.getId(), false);
        }
    }

    public String generateTokenForUser(User user) {
        return jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
    }

    public void forgotPassword(String email) {
        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Don't reveal if user exists or not for security
            return;
        }

        User user = userOpt.get();
        String resetToken = UUID.randomUUID().toString();
        LocalDateTime expiryTime = LocalDateTime.now().plusHours(1); // 1 hour expiry

        user.setResetToken(resetToken);
        user.setResetTokenExpiry(expiryTime);
        userService.saveUser(user);

        String resetUrl = frontendUrl + "/reset-password";
        
        try {
            emailService.sendPasswordResetEmail(email, resetToken, resetUrl);
        } catch (Exception e) {
            // Log the error but don't fail the request
            System.err.println("Failed to send email: " + e.getMessage());
            System.out.println("Reset token for testing: " + resetToken);
            System.out.println("Reset URL: " + resetUrl + "?token=" + resetToken);
        }
    }

    public boolean resetPassword(String token, String newPassword) {
        Optional<User> userOpt = userService.findByResetToken(token);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        
        // Check if token is expired
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return false;
        }

        // Update password and clear reset token
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userService.saveUser(user);

        // Send success email
        emailService.sendPasswordResetSuccessEmail(user.getEmail());

        return true;
    }

    public boolean validateResetToken(String token) {
        Optional<User> userOpt = userService.findByResetToken(token);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        return !user.getResetTokenExpiry().isBefore(LocalDateTime.now());
    }
} 