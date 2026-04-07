package com.nerdsoncall.service;

import com.nerdsoncall.entity.TutorStatus;
import com.nerdsoncall.entity.User;
import com.nerdsoncall.repository.TutorStatusRepository;
import com.nerdsoncall.repository.UserRepository;
import com.nerdsoncall.dto.TutorWithStatusDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TutorStatusService {
    
    @Autowired
    private TutorStatusRepository tutorStatusRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Toggle tutor online/offline status
     */
    public TutorStatus toggleTutorStatus(Long tutorId) {
        Optional<TutorStatus> existingStatus = tutorStatusRepository.findByTutorId(tutorId);
        
        if (existingStatus.isPresent()) {
            TutorStatus status = existingStatus.get();
            // Toggle status
            status.setStatus(status.getStatus() == TutorStatus.Status.ONLINE 
                ? TutorStatus.Status.OFFLINE 
                : TutorStatus.Status.ONLINE);
            return tutorStatusRepository.save(status);
        } else {
            // Create new status entry - default to ONLINE when first toggled
            TutorStatus newStatus = new TutorStatus(tutorId, TutorStatus.Status.ONLINE);
            return tutorStatusRepository.save(newStatus);
        }
    }
    
    /**
     * Set tutor status explicitly
     */
    public TutorStatus setTutorStatus(Long tutorId, TutorStatus.Status status) {
        Optional<TutorStatus> existingStatus = tutorStatusRepository.findByTutorId(tutorId);
        
        if (existingStatus.isPresent()) {
            TutorStatus tutorStatus = existingStatus.get();
            tutorStatus.setStatus(status);
            return tutorStatusRepository.save(tutorStatus);
        } else {
            TutorStatus newStatus = new TutorStatus(tutorId, status);
            return tutorStatusRepository.save(newStatus);
        }
    }
    
    /**
     * Get tutor status
     */
    public TutorStatus.Status getTutorStatus(Long tutorId) {
        return tutorStatusRepository.findByTutorId(tutorId)
            .map(TutorStatus::getStatus)
            .orElse(TutorStatus.Status.OFFLINE); // Default to offline if no record
    }
    
    /**
     * Check if tutor is online
     */
    public boolean isTutorOnline(Long tutorId) {
        return tutorStatusRepository.isTutorOnline(tutorId);
    }
    
    /**
     * Get all online tutor IDs
     */
    public List<Long> getOnlineTutorIds() {
        return tutorStatusRepository.findTutorIdsByStatus(TutorStatus.Status.ONLINE);
    }
    
    /**
     * Get all online tutors with their user details
     */
    public List<User> getOnlineTutors() {
        List<Long> onlineTutorIds = getOnlineTutorIds();
        if (onlineTutorIds.isEmpty()) {
            return List.of();
        }
        
        return userRepository.findByIdInAndRole(onlineTutorIds, User.Role.TUTOR);
    }
    
    /**
     * Get online tutors by subject
     */
    public List<User> getOnlineTutorsBySubject(User.Subject subject) {
        List<Long> onlineTutorIds = getOnlineTutorIds();
        if (onlineTutorIds.isEmpty()) {
            return List.of();
        }
        
        return userRepository.findByIdInAndRoleAndSubjectsContaining(onlineTutorIds, User.Role.TUTOR, subject);
    }
    
    /**
     * Get count of online tutors
     */
    public long getOnlineTutorCount() {
        return tutorStatusRepository.countOnlineTutors();
    }
    
    /**
     * Initialize tutor status when tutor registers
     */
    public TutorStatus initializeTutorStatus(Long tutorId) {
        if (!tutorStatusRepository.existsByTutorId(tutorId)) {
            TutorStatus newStatus = new TutorStatus(tutorId, TutorStatus.Status.OFFLINE);
            return tutorStatusRepository.save(newStatus);
        }
        return tutorStatusRepository.findByTutorId(tutorId).get();
    }
    
    /**
     * Remove tutor status when tutor is deleted
     */
    public void removeTutorStatus(Long tutorId) {
        tutorStatusRepository.deleteByTutorId(tutorId);
    }
    
    /**
     * Get all tutors with their status information
     */
    public List<TutorWithStatusDTO> getAllTutorsWithStatus() {
        List<User> allTutors = userRepository.findByRole(User.Role.TUTOR);
        return allTutors.stream()
            .map(tutor -> {
                Optional<TutorStatus> status = tutorStatusRepository.findByTutorId(tutor.getId());
                return new TutorWithStatusDTO(tutor, status.orElse(null));
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Get online tutors with their status information
     */
    public List<TutorWithStatusDTO> getOnlineTutorsWithStatus() {
        List<User> onlineTutors = getOnlineTutors();
        return onlineTutors.stream()
            .map(tutor -> {
                Optional<TutorStatus> status = tutorStatusRepository.findByTutorId(tutor.getId());
                return new TutorWithStatusDTO(tutor, status.orElse(null));
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Get online tutors by subject with their status information
     */
    public List<TutorWithStatusDTO> getOnlineTutorsBySubjectWithStatus(User.Subject subject) {
        List<User> onlineTutors = getOnlineTutorsBySubject(subject);
        return onlineTutors.stream()
            .map(tutor -> {
                Optional<TutorStatus> status = tutorStatusRepository.findByTutorId(tutor.getId());
                return new TutorWithStatusDTO(tutor, status.orElse(null));
            })
            .collect(Collectors.toList());
    }
}
