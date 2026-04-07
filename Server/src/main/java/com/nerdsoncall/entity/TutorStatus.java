package com.nerdsoncall.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tutor_status")
public class TutorStatus {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "tutor_id", nullable = false, unique = true)
    private Long tutorId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.OFFLINE;
    
    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated = LocalDateTime.now();
    
    public enum Status {
        ONLINE, OFFLINE
    }
    
    // Constructors
    public TutorStatus() {}
    
    public TutorStatus(Long tutorId, Status status) {
        this.tutorId = tutorId;
        this.status = status;
        this.lastUpdated = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getTutorId() {
        return tutorId;
    }
    
    public void setTutorId(Long tutorId) {
        this.tutorId = tutorId;
    }
    
    public Status getStatus() {
        return status;
    }
    
    public void setStatus(Status status) {
        this.status = status;
        this.lastUpdated = LocalDateTime.now();
    }
    
    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    // Helper methods
    public boolean isOnline() {
        return status == Status.ONLINE;
    }
    
    public boolean isOffline() {
        return status == Status.OFFLINE;
    }
    
    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        this.lastUpdated = LocalDateTime.now();
    }
}
