package com.nerdsoncall.service;

import com.nerdsoncall.entity.Doubt;
import com.nerdsoncall.entity.Session;
import com.nerdsoncall.entity.User;
import com.nerdsoncall.entity.Feedback;
import com.nerdsoncall.repository.DoubtRepository;
import com.nerdsoncall.repository.SessionRepository;
import com.nerdsoncall.repository.UserRepository;
import com.nerdsoncall.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private DoubtRepository doubtRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    // Get student dashboard statistics
    public Map<String, Object> getStudentDashboardStats(Long studentId) {
        try {
            System.out.println("Fetching dashboard stats for student ID: " + studentId);
            
            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            Map<String, Object> stats = new HashMap<>();
            
            // Get all sessions for the student
            List<Session> allSessions = sessionRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
            System.out.println("Found " + allSessions.size() + " total sessions for student");
            
            // Sessions attended (completed sessions)
            List<Session> completedSessions = allSessions.stream()
                    .filter(session -> session.getStatus() == Session.Status.COMPLETED)
                    .collect(Collectors.toList());
            
            int sessionsAttended = completedSessions.size();
            System.out.println("Completed sessions: " + sessionsAttended);
            
            // Hours learned (sum of duration from completed sessions)
            long totalMinutes = completedSessions.stream()
                    .mapToLong(session -> session.getDurationMinutes() != null ? session.getDurationMinutes() : 0)
                    .sum();
            double hoursLearned = totalMinutes / 60.0;
            System.out.println("Total learning time: " + totalMinutes + " minutes (" + hoursLearned + " hours)");
            
            // Active sessions (pending or active status)
            long activeSessions = allSessions.stream()
                    .filter(session -> session.getStatus() == Session.Status.PENDING || 
                                     session.getStatus() == Session.Status.ACTIVE)
                    .count();
            
            // Open questions (doubts that are not resolved) - with error handling
            long openQuestions = 0;
            try {
                List<Doubt> studentDoubts = doubtRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
                openQuestions = studentDoubts.stream()
                        .filter(doubt -> doubt.getStatus() != Doubt.Status.RESOLVED)
                        .count();
                System.out.println("Open questions: " + openQuestions);
            } catch (Exception e) {
                System.err.println("Error fetching doubts for open questions: " + e.getMessage());
                // Try fallback method using the student object we already have
                try {
                    List<Doubt> fallbackDoubts = doubtRepository.findByStudent(student);
                    openQuestions = fallbackDoubts.stream()
                            .filter(doubt -> doubt.getStatus() != Doubt.Status.RESOLVED)
                            .count();
                    System.out.println("Used fallback method, open questions: " + openQuestions);
                } catch (Exception fallbackError) {
                    System.err.println("Fallback method also failed: " + fallbackError.getMessage());
                    // Continue with openQuestions = 0
                }
            }
            
            // Favorite tutors (count unique tutors from completed sessions)
            long favoriteTutors = completedSessions.stream()
                    .filter(session -> session.getTutor() != null)
                    .map(session -> session.getTutor().getId())
                    .distinct()
                    .count();
            
            // Recent activities (last 5 sessions and doubts)
            List<Map<String, Object>> recentActivities = getRecentActivities(studentId);
            
            // Build response
            stats.put("sessionsAttended", sessionsAttended);
            stats.put("hoursLearned", Math.round(hoursLearned * 10.0) / 10.0); // Round to 1 decimal
            stats.put("activeSessions", activeSessions);
            stats.put("openQuestions", openQuestions);
            stats.put("favoriteTutors", favoriteTutors);
            stats.put("recentActivities", recentActivities);
            stats.put("totalCost", calculateTotalCost(completedSessions));
            
            System.out.println("Dashboard stats calculated successfully");
            return stats;
            
        } catch (Exception e) {
            System.err.println("Error fetching dashboard stats: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch dashboard stats: " + e.getMessage());
        }
    }

    // Get tutor dashboard statistics
    public Map<String, Object> getTutorDashboardStats(Long tutorId) {
        try {
            System.out.println("Fetching dashboard stats for tutor ID: " + tutorId);

            User tutor = userRepository.findById(tutorId)
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));

            if (tutor.getRole() != User.Role.TUTOR) {
                throw new RuntimeException("User is not a tutor");
            }

            Map<String, Object> stats = new HashMap<>();

            // Get all sessions for the tutor
            List<Session> allSessions = sessionRepository.findByTutorIdOrderByCreatedAtDesc(tutorId);
            System.out.println("Found " + allSessions.size() + " total sessions for tutor");

            // Sessions taught (completed sessions)
            List<Session> completedSessions = allSessions.stream()
                    .filter(session -> session.getStatus() == Session.Status.COMPLETED)
                    .collect(Collectors.toList());

            int sessionsTaught = completedSessions.size();
            System.out.println("Completed sessions: " + sessionsTaught);

            // Hours taught (sum of duration from completed sessions)
            long totalMinutes = completedSessions.stream()
                    .mapToLong(session -> session.getDurationMinutes() != null ? session.getDurationMinutes() : 0)
                    .sum();
            double hoursTaught = totalMinutes / 60.0;
            System.out.println("Total teaching time: " + totalMinutes + " minutes (" + hoursTaught + " hours)");

            // Pending sessions
            long pendingSessions = allSessions.stream()
                    .filter(session -> session.getStatus() == Session.Status.PENDING ||
                                     session.getStatus() == Session.Status.ACTIVE)
                    .count();

            // Total earnings from completed sessions
            double totalEarnings = completedSessions.stream()
                    .filter(session -> session.getTutorEarnings() != null)
                    .mapToDouble(session -> session.getTutorEarnings().doubleValue())
                    .sum();

            // Active students (unique students from completed sessions)
            long activeStudents = completedSessions.stream()
                    .filter(session -> session.getStudent() != null)
                    .map(session -> session.getStudent().getId())
                    .distinct()
                    .count();

            // Rating from feedback
            Double rating = feedbackRepository.findAverageRatingForTutor(tutor);
            if (rating == null) rating = 0.0;

            // Calculate monthly growth (compare current month with previous month)
            Map<String, Object> monthlyGrowth = calculateTutorMonthlyGrowth(tutorId);

            // Recent activities (last 5 sessions and feedback)
            List<Map<String, Object>> recentActivities = getTutorRecentActivities(tutorId);

            // Build response
            stats.put("sessionsTaught", sessionsTaught);
            stats.put("hoursTaught", Math.round(hoursTaught * 10.0) / 10.0); // Round to 1 decimal
            stats.put("totalEarnings", Math.round(totalEarnings * 100.0) / 100.0); // Round to 2 decimals
            stats.put("rating", Math.round(rating * 10.0) / 10.0); // Round to 1 decimal
            stats.put("activeStudents", activeStudents);
            stats.put("pendingSessions", pendingSessions);
            stats.put("recentActivities", recentActivities);
            stats.put("monthlyGrowth", monthlyGrowth);

            System.out.println("Tutor dashboard stats calculated successfully");
            return stats;

        } catch (Exception e) {
            System.err.println("Error fetching tutor dashboard stats: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch tutor dashboard stats: " + e.getMessage());
        }
    }

    // Get recent activities for student
    private List<Map<String, Object>> getRecentActivities(Long studentId) {
        try {
            System.out.println("Fetching recent activities for student: " + studentId);

            // Get student object once for fallback use
            User student = userRepository.findById(studentId).orElse(null);

            // Get recent sessions
            List<Session> recentSessions = sessionRepository.findByStudentIdOrderByCreatedAtDesc(studentId)
                    .stream()
                    .limit(3)
                    .collect(Collectors.toList());
            System.out.println("Found " + recentSessions.size() + " recent sessions");

            // Get recent doubts - with error handling and fallback
            List<Doubt> recentDoubts;
            try {
                recentDoubts = doubtRepository.findByStudentIdOrderByCreatedAtDesc(studentId)
                        .stream()
                        .limit(2)
                        .collect(Collectors.toList());
                System.out.println("Found " + recentDoubts.size() + " recent doubts");
            } catch (Exception e) {
                System.err.println("Error fetching recent doubts: " + e.getMessage());
                // Try fallback method using the student object we already have
                try {
                    if (student != null) {
                        recentDoubts = doubtRepository.findByStudent(student)
                                .stream()
                                .limit(2)
                                .collect(Collectors.toList());
                        System.out.println("Used fallback method for recent doubts: " + recentDoubts.size());
                    } else {
                        recentDoubts = List.of();
                    }
                } catch (Exception fallbackError) {
                    System.err.println("Fallback method for doubts also failed: " + fallbackError.getMessage());
                    recentDoubts = List.of(); // Return empty list if both methods fail
                }
            }
            
            List<Map<String, Object>> activities = recentSessions.stream()
                    .map(this::sessionToActivity)
                    .collect(Collectors.toList());
            
            activities.addAll(recentDoubts.stream()
                    .map(this::doubtToActivity)
                    .collect(Collectors.toList()));
            
            // Sort by timestamp (most recent first)
            activities.sort((a, b) -> {
                LocalDateTime timeA = (LocalDateTime) a.get("timestamp");
                LocalDateTime timeB = (LocalDateTime) b.get("timestamp");
                return timeB.compareTo(timeA);
            });
            
            return activities.stream().limit(5).collect(Collectors.toList());
            
        } catch (Exception e) {
            System.err.println("Error fetching recent activities: " + e.getMessage());
            return List.of(); // Return empty list on error
        }
    }
    
    // Convert session to activity format
    private Map<String, Object> sessionToActivity(Session session) {
        Map<String, Object> activity = new HashMap<>();
        
        String title = "Session";
        String subtitle = "Learning session";
        String icon = "Video";
        String color = "text-slate-600";
        String bg = "bg-slate-100";
        
        if (session.getStatus() == Session.Status.COMPLETED) {
            title = "Session Completed";
            color = "text-emerald-600";
            bg = "bg-emerald-100";
            if (session.getTutor() != null) {
                subtitle = "With " + session.getTutor().getFirstName() + " " + session.getTutor().getLastName();
            }
            if (session.getDurationMinutes() != null && session.getDurationMinutes() > 0) {
                subtitle += " (" + session.getDurationMinutes() + " min)";
            }
        } else if (session.getStatus() == Session.Status.ACTIVE) {
            title = "Session In Progress";
            color = "text-blue-600";
            bg = "bg-blue-100";
        } else if (session.getStatus() == Session.Status.PENDING) {
            title = "Session Scheduled";
            color = "text-amber-600";
            bg = "bg-amber-100";
        }
        
        activity.put("title", title);
        activity.put("subtitle", subtitle);
        activity.put("time", getTimeAgo(session.getCreatedAt()));
        activity.put("icon", icon);
        activity.put("color", color);
        activity.put("bg", bg);
        activity.put("timestamp", session.getCreatedAt());
        
        return activity;
    }
    
    // Convert doubt to activity format
    private Map<String, Object> doubtToActivity(Doubt doubt) {
        Map<String, Object> activity = new HashMap<>();
        
        String title = "Question Posted";
        String subtitle = doubt.getTitle();
        String icon = "BookOpen";
        String color = "text-slate-600";
        String bg = "bg-slate-100";
        
        if (doubt.getStatus() == Doubt.Status.RESOLVED) {
            title = "Question Resolved";
            color = "text-emerald-600";
            bg = "bg-emerald-100";
        } else if (doubt.getStatus() == Doubt.Status.IN_PROGRESS) {
            title = "Question In Progress";
            color = "text-blue-600";
            bg = "bg-blue-100";
        }
        
        activity.put("title", title);
        activity.put("subtitle", subtitle.length() > 50 ? subtitle.substring(0, 50) + "..." : subtitle);
        activity.put("time", getTimeAgo(doubt.getCreatedAt()));
        activity.put("icon", icon);
        activity.put("color", color);
        activity.put("bg", bg);
        activity.put("timestamp", doubt.getCreatedAt());
        
        return activity;
    }
    
    // Calculate total cost spent by student
    private double calculateTotalCost(List<Session> completedSessions) {
        return completedSessions.stream()
                .filter(session -> session.getCost() != null)
                .mapToDouble(session -> session.getCost().doubleValue())
                .sum();
    }
    
    // Helper method to get "time ago" string
    private String getTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "Unknown";
        
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(dateTime, now).toMinutes();
        
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + " minutes ago";
        
        long hours = minutes / 60;
        if (hours < 24) return hours + " hours ago";
        
        long days = hours / 24;
        if (days < 7) return days + " days ago";
        
        long weeks = days / 7;
        if (weeks < 4) return weeks + " weeks ago";
        
        return dateTime.format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));
    }

    // Calculate monthly growth for tutor
    private Map<String, Object> calculateTutorMonthlyGrowth(Long tutorId) {
        Map<String, Object> growth = new HashMap<>();

        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime currentMonthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime previousMonthStart = currentMonthStart.minusMonths(1);
            LocalDateTime previousMonthEnd = currentMonthStart.minusSeconds(1);

            User tutor = userRepository.findById(tutorId).orElse(null);
            if (tutor == null) {
                growth.put("sessionsGrowth", 0);
                growth.put("hoursGrowth", 0);
                growth.put("earningsGrowth", 0);
                return growth;
            }

            // Current month stats
            List<Session> currentMonthSessions = sessionRepository.findByTutorIdOrderByCreatedAtDesc(tutorId)
                    .stream()
                    .filter(s -> s.getCreatedAt().isAfter(currentMonthStart) && s.getStatus() == Session.Status.COMPLETED)
                    .collect(Collectors.toList());

            // Previous month stats
            List<Session> previousMonthSessions = sessionRepository.findByTutorIdOrderByCreatedAtDesc(tutorId)
                    .stream()
                    .filter(s -> s.getCreatedAt().isAfter(previousMonthStart) &&
                               s.getCreatedAt().isBefore(previousMonthEnd) &&
                               s.getStatus() == Session.Status.COMPLETED)
                    .collect(Collectors.toList());

            // Calculate growth percentages
            int currentSessions = currentMonthSessions.size();
            int previousSessions = previousMonthSessions.size();
            double sessionsGrowth = previousSessions > 0 ?
                ((double)(currentSessions - previousSessions) / previousSessions) * 100 : 0;

            double currentHours = currentMonthSessions.stream()
                    .mapToLong(s -> s.getDurationMinutes() != null ? s.getDurationMinutes() : 0)
                    .sum() / 60.0;
            double previousHours = previousMonthSessions.stream()
                    .mapToLong(s -> s.getDurationMinutes() != null ? s.getDurationMinutes() : 0)
                    .sum() / 60.0;
            double hoursGrowth = previousHours > 0 ?
                ((currentHours - previousHours) / previousHours) * 100 : 0;

            double currentEarnings = currentMonthSessions.stream()
                    .filter(s -> s.getTutorEarnings() != null)
                    .mapToDouble(s -> s.getTutorEarnings().doubleValue())
                    .sum();
            double previousEarnings = previousMonthSessions.stream()
                    .filter(s -> s.getTutorEarnings() != null)
                    .mapToDouble(s -> s.getTutorEarnings().doubleValue())
                    .sum();
            double earningsGrowth = previousEarnings > 0 ?
                ((currentEarnings - previousEarnings) / previousEarnings) * 100 : 0;

            growth.put("sessionsGrowth", Math.round(sessionsGrowth * 10.0) / 10.0);
            growth.put("hoursGrowth", Math.round(hoursGrowth * 10.0) / 10.0);
            growth.put("earningsGrowth", Math.round(earningsGrowth * 10.0) / 10.0);

        } catch (Exception e) {
            System.err.println("Error calculating monthly growth: " + e.getMessage());
            growth.put("sessionsGrowth", 0);
            growth.put("hoursGrowth", 0);
            growth.put("earningsGrowth", 0);
        }

        return growth;
    }

    // Get recent activities for tutor
    private List<Map<String, Object>> getTutorRecentActivities(Long tutorId) {
        try {
            System.out.println("Fetching recent activities for tutor: " + tutorId);

            User tutor = userRepository.findById(tutorId).orElse(null);
            if (tutor == null) return List.of();

            // Get recent sessions
            List<Session> recentSessions = sessionRepository.findByTutorIdOrderByCreatedAtDesc(tutorId)
                    .stream()
                    .limit(3)
                    .collect(Collectors.toList());
            System.out.println("Found " + recentSessions.size() + " recent sessions for tutor");

            // Get recent feedback received
            List<Feedback> recentFeedback = feedbackRepository.findTutorFeedbackOrderByCreatedAtDesc(tutor)
                    .stream()
                    .limit(2)
                    .collect(Collectors.toList());
            System.out.println("Found " + recentFeedback.size() + " recent feedback for tutor");

            List<Map<String, Object>> activities = recentSessions.stream()
                    .map(this::tutorSessionToActivity)
                    .collect(Collectors.toList());

            activities.addAll(recentFeedback.stream()
                    .map(this::feedbackToActivity)
                    .collect(Collectors.toList()));

            // Sort by timestamp (most recent first)
            activities.sort((a, b) -> {
                LocalDateTime timeA = (LocalDateTime) a.get("timestamp");
                LocalDateTime timeB = (LocalDateTime) b.get("timestamp");
                return timeB.compareTo(timeA);
            });

            return activities.stream().limit(5).collect(Collectors.toList());

        } catch (Exception e) {
            System.err.println("Error fetching tutor recent activities: " + e.getMessage());
            return List.of();
        }
    }

    // Convert session to activity format for tutor
    private Map<String, Object> tutorSessionToActivity(Session session) {
        Map<String, Object> activity = new HashMap<>();

        String title = "Session Taught";
        String subtitle = "Session with student";
        String icon = "Video";
        String color = "text-slate-600";
        String bg = "bg-slate-100";

        if (session.getStudent() != null) {
            subtitle = "Session with " + session.getStudent().getFirstName() + " " + session.getStudent().getLastName();
        }

        if (session.getStatus() == Session.Status.COMPLETED) {
            title = "Session Completed";
            color = "text-emerald-600";
            bg = "bg-emerald-100";
            if (session.getDurationMinutes() != null && session.getDurationMinutes() > 0) {
                subtitle += " (" + session.getDurationMinutes() + " min)";
            }
        } else if (session.getStatus() == Session.Status.ACTIVE) {
            title = "Session In Progress";
            color = "text-blue-600";
            bg = "bg-blue-100";
        } else if (session.getStatus() == Session.Status.PENDING) {
            title = "Session Scheduled";
            color = "text-amber-600";
            bg = "bg-amber-100";
        }

        activity.put("title", title);
        activity.put("subtitle", subtitle);
        activity.put("time", getTimeAgo(session.getCreatedAt()));
        activity.put("icon", icon);
        activity.put("color", color);
        activity.put("bg", bg);
        activity.put("timestamp", session.getCreatedAt());

        return activity;
    }

    // Convert feedback to activity format
    private Map<String, Object> feedbackToActivity(Feedback feedback) {
        Map<String, Object> activity = new HashMap<>();

        String title = "Feedback Received";
        String subtitle = "Rating: " + feedback.getRating() + "/5";
        String icon = "Star";
        String color = "text-amber-600";
        String bg = "bg-amber-100";

        if (feedback.getReviewer() != null) {
            subtitle = "From " + feedback.getReviewer().getFirstName() + " - " + feedback.getRating() + "/5";
        }

        if (feedback.getComment() != null && !feedback.getComment().trim().isEmpty()) {
            subtitle += " - " + (feedback.getComment().length() > 30 ?
                feedback.getComment().substring(0, 30) + "..." : feedback.getComment());
        }

        activity.put("title", title);
        activity.put("subtitle", subtitle);
        activity.put("time", getTimeAgo(feedback.getCreatedAt()));
        activity.put("icon", icon);
        activity.put("color", color);
        activity.put("bg", bg);
        activity.put("timestamp", feedback.getCreatedAt());

        return activity;
    }
}
