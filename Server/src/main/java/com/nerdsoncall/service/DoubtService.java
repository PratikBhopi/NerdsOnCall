package com.nerdsoncall.service;

import com.nerdsoncall.entity.Doubt;
import com.nerdsoncall.entity.Subscription;
import com.nerdsoncall.entity.User;
import com.nerdsoncall.repository.DoubtRepository;
import com.nerdsoncall.service.SubscriptionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DoubtService {

    @Autowired
    private DoubtRepository doubtRepository;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private SessionService sessionService;

    public Doubt createDoubt(Doubt doubt) {
        // Check session limit before creating doubt
        validateSessionLimit(doubt.getStudent());

        Doubt savedDoubt = doubtRepository.save(doubt);

        // Increment session usage when doubt is created
        // This ensures doubts count towards session limit just like video calls
        try {
            subscriptionService.incrementSessionUsage(doubt.getStudent());
            System.out.println("Session usage incremented for doubt creation by student: " + doubt.getStudent().getEmail());
        } catch (Exception e) {
            System.err.println("Failed to increment session usage for doubt: " + e.getMessage());
            // Don't fail doubt creation if usage increment fails
        }

        System.out.println("Doubt created successfully - Session usage incremented");

        return savedDoubt;
    }

    private void validateSessionLimit(User student) {
        Optional<Subscription> activeSubscription = subscriptionService.getActiveSubscription(student);

        if (!activeSubscription.isPresent()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "No active subscription found. Please subscribe to a plan to ask doubts.");
        }

        Subscription subscription = activeSubscription.get();

        if (subscription.getSessionsUsed() >= subscription.getSessionsLimit()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Daily session limit reached. You have used " + subscription.getSessionsUsed() +
                " out of " + subscription.getSessionsLimit() + " allowed sessions for today. This limit is shared between doubts and video calls.");
        }
    }

    public List<Doubt> getDoubtsByStudent(User student) {
        return doubtRepository.findByStudent(student);
    }

    public List<Doubt> getOpenDoubts() {
        return doubtRepository.findOpenDoubtsOrderByPriorityAndCreatedAt();
    }

    public List<Doubt> getOpenDoubtsBySubject(User.Subject subject) {
        return doubtRepository.findOpenDoubtsBySubjectOrderByPriorityAndCreatedAt(subject);
    }

    public List<Doubt> getOpenDoubtsByPreferredTutor(Long tutorId) {
        return doubtRepository.findOpenDoubtsByPreferredTutor(tutorId);
    }

    public List<Doubt> getAllDoubtsByPreferredTutor(Long tutorId) {
        return doubtRepository.findByPreferredTutorIdOrderByCreatedAtDesc(tutorId);
    }

    public Optional<Doubt> findById(Long id) {
        return doubtRepository.findById(id);
    }

    public List<Doubt> getAllDoubtsForTutor(Long tutorId) {
        // Return all open doubts and those with preferredTutorId matching this tutor
        return doubtRepository.findAllOpenOrPreferredForTutor(tutorId);
    }

    public Doubt updateDoubtStatus(Long doubtId, Doubt.Status status, User tutor) {
        Doubt doubt = doubtRepository.findById(doubtId)
                .orElseThrow(() -> new RuntimeException("Doubt not found"));

        // Update status and assign tutor
        doubt.setStatus(status);
        if (status == Doubt.Status.ASSIGNED && tutor != null) {
            doubt.setAcceptedTutor(tutor);
            try {
                sessionService.createSession(doubt.getStudent().getId(), tutor.getId(), doubtId);
            } catch (Exception e) {
                System.err.println("Error creating session for doubt: " + e.getMessage());
            }
        }
        return doubtRepository.save(doubt);
    }

    public Doubt submitSolution(Long doubtId, String solutionDescription, MultipartFile videoFile, User tutor) {
        Doubt doubt = doubtRepository.findById(doubtId)
                .orElseThrow(() -> new RuntimeException("Doubt not found"));

        // Validate input
        if (solutionDescription == null || solutionDescription.trim().isEmpty()) {
            throw new RuntimeException("Solution description is required");
        }

        // Check if tutor is authorized to solve this doubt
        if (doubt.getPreferredTutorId() != null && !doubt.getPreferredTutorId().equals(tutor.getId())) {
            throw new RuntimeException("You are not authorized to solve this doubt");
        }

        // Upload video to Cloudinary if provided
        String videoUrl = null;
        if (videoFile != null && !videoFile.isEmpty()) {
            try {
                videoUrl = uploadVideoToCloudinary(videoFile);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload video: " + e.getMessage());
            }
        }

        // Update doubt with solution
        doubt.setSolutionDescription(solutionDescription);
        doubt.setVideoUrl(videoUrl);
        doubt.setAcceptedTutor(tutor);
        doubt.setStatus(Doubt.Status.RESOLVED);
        doubt.setResolvedAt(LocalDateTime.now());

        return doubtRepository.save(doubt);
    }

    @SuppressWarnings("unchecked")
    private String uploadVideoToCloudinary(MultipartFile file) throws IOException {
        Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", "video",
                        "folder", "doubt_solutions"
                )
        );

        return (String) uploadResult.get("secure_url");
    }
}