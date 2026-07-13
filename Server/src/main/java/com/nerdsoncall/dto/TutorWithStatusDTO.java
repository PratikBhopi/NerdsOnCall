package com.nerdsoncall.dto;

import com.nerdsoncall.entity.User;
import com.nerdsoncall.entity.TutorStatus;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;

public class TutorWithStatusDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String bio;
    private String profilePicture;
    private Set<User.Subject> subjects;
    private double rating;
    private int totalSessions;
    private double hourlyRate;
    private boolean isOnline;
    private TutorStatus.Status status;
    private LocalDateTime lastStatusUpdate;
    
    public TutorWithStatusDTO() {}
    
    public TutorWithStatusDTO(User user, TutorStatus tutorStatus) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.bio = user.getBio();
        this.profilePicture = user.getProfilePicture();
        this.subjects = new HashSet<>(user.getSubjects());
        this.rating = user.getRating();
        this.totalSessions = user.getTotalSessions();
        this.hourlyRate = user.getHourlyRate();
        
        if (tutorStatus != null) {
            this.isOnline = tutorStatus.isOnline();
            this.status = tutorStatus.getStatus();
            this.lastStatusUpdate = tutorStatus.getLastUpdated();
        } else {
            this.isOnline = false;
            this.status = TutorStatus.Status.OFFLINE;
            this.lastStatusUpdate = null;
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getBio() {
        return bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
    }
    
    public String getProfilePicture() {
        return profilePicture;
    }
    
    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }
    
    public Set<User.Subject> getSubjects() {
        return subjects;
    }
    
    public void setSubjects(Set<User.Subject> subjects) {
        this.subjects = subjects;
    }
    
    public double getRating() {
        return rating;
    }
    
    public void setRating(double rating) {
        this.rating = rating;
    }
    
    public int getTotalSessions() {
        return totalSessions;
    }
    
    public void setTotalSessions(int totalSessions) {
        this.totalSessions = totalSessions;
    }
    
    public double getHourlyRate() {
        return hourlyRate;
    }
    
    public void setHourlyRate(double hourlyRate) {
        this.hourlyRate = hourlyRate;
    }
    
    public boolean isOnline() {
        return isOnline;
    }
    
    public void setOnline(boolean online) {
        isOnline = online;
    }
    
    public TutorStatus.Status getStatus() {
        return status;
    }
    
    public void setStatus(TutorStatus.Status status) {
        this.status = status;
    }
    
    public LocalDateTime getLastStatusUpdate() {
        return lastStatusUpdate;
    }
    
    public void setLastStatusUpdate(LocalDateTime lastStatusUpdate) {
        this.lastStatusUpdate = lastStatusUpdate;
    }
}
