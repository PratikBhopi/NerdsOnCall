package com.nerdsoncall.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private Boolean isOnline = false;

    private String profilePicture;

    private String phoneNumber;

    public String getFullName() {
        return String.format("%s %s", firstName, lastName).trim();
    }

    // Tutor specific fields
    private String bio;
    
    @ElementCollection
    @Enumerated(EnumType.STRING)
    private List<Subject> subjects;

    private Double rating = 0.0;
    
    private Integer totalSessions = 0;

    @Column(precision = 10)
    private Double totalEarnings = 0.0;

    @Column(precision = 10)
    private Double hourlyRate = 0.0;

    private String razorpayContactId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Password reset fields
    private String resetToken;
    private LocalDateTime resetTokenExpiry;

    public enum Role {
        STUDENT, TUTOR, ADMIN
    }

    public enum Subject {
        MATHEMATICS, PHYSICS, CHEMISTRY, BIOLOGY, COMPUTER_SCIENCE, 
        ENGLISH, HISTORY, GEOGRAPHY, ECONOMICS, ACCOUNTING, 
        STATISTICS, CALCULUS, ALGEBRA, GEOMETRY, TRIGONOMETRY
    }
} 