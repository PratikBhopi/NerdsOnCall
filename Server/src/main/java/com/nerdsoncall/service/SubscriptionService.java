package com.nerdsoncall.service;

import com.nerdsoncall.entity.Subscription;
import com.nerdsoncall.entity.User;
import com.nerdsoncall.repository.SubscriptionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    public Subscription saveSubscription(Subscription subscription) {
        return subscriptionRepository.save(subscription);
    }

    public Optional<Subscription> getActiveSubscription(User user) {
        return subscriptionRepository.findActiveSubscriptionByUser(user, LocalDateTime.now());
    }

    public List<Subscription> getSubscriptionsByUser(User user) {
        return subscriptionRepository.findByUser(user);
    }

    public boolean canUserCreateSession(User user) {
        // First check if user has a valid subscription
        if (!hasValidSubscription(user)) {
            return false;
        }

        Optional<Subscription> activeSubscription = getActiveSubscription(user);
        if (activeSubscription.isEmpty()) {
            return false;
        }

        Subscription subscription = activeSubscription.get();

        // Check session limits (unlimited if limit is -1)
        if (subscription.getSessionsLimit() != -1) {
            return subscription.getSessionsUsed() < subscription.getSessionsLimit();
        }

        return true;
    }

    public void incrementSessionUsage(User user) {
        Optional<Subscription> activeSubscription = getActiveSubscription(user);
        if (activeSubscription.isPresent()) {
            Subscription subscription = activeSubscription.get();
            subscription.setSessionsUsed(subscription.getSessionsUsed() + 1);
            subscriptionRepository.save(subscription);
            System.out.println("Session usage incremented for user: " + user.getEmail() + " - New count: " + subscription.getSessionsUsed());
        }
    }

    public void decrementSessionUsage(User user) {
        Optional<Subscription> activeSubscription = getActiveSubscription(user);
        if (activeSubscription.isPresent()) {
            Subscription subscription = activeSubscription.get();
            // Prevent negative session usage
            if (subscription.getSessionsUsed() > 0) {
                subscription.setSessionsUsed(subscription.getSessionsUsed() - 1);
                subscriptionRepository.save(subscription);
                System.out.println("Session usage decremented for user: " + user.getEmail() + " - New count: " + subscription.getSessionsUsed());
            } else {
                System.out.println("Cannot decrement session usage below 0 for user: " + user.getEmail());
            }
        }
    }

    public List<Subscription> getExpiredSubscriptions() {
        return subscriptionRepository.findExpiredSubscriptions(LocalDateTime.now());
    }

    public void processExpiredSubscriptions() {
        List<Subscription> expiredSubscriptions = getExpiredSubscriptions();
        int expiredCount = 0;
        for (Subscription subscription : expiredSubscriptions) {
            subscription.setStatus(Subscription.Status.EXPIRED);
            subscriptionRepository.save(subscription);
            expiredCount++;

            // Log the expiration
            System.out.println("Expired subscription for user: " + subscription.getUser().getEmail() +
                " (Plan: " + subscription.getPlanName() + ", End Date: " + subscription.getEndDate() + ")");
        }

        if (expiredCount > 0) {
            System.out.println("Processed " + expiredCount + " expired subscriptions");
        }
    }

    /**
     * Clean up expired subscriptions that are older than 30 days
     * This helps keep the database clean while maintaining some history
     */
    public void cleanupOldExpiredSubscriptions() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        List<Subscription> oldExpiredSubscriptions = subscriptionRepository.findExpiredSubscriptionsOlderThan(cutoffDate);

        int deletedCount = 0;
        for (Subscription subscription : oldExpiredSubscriptions) {
            System.out.println("Deleting old expired subscription for user: " + subscription.getUser().getEmail() +
                " (Expired: " + subscription.getEndDate() + ")");
            subscriptionRepository.delete(subscription);
            deletedCount++;
        }

        if (deletedCount > 0) {
            System.out.println("Cleaned up " + deletedCount + " old expired subscriptions");
        }
    }

    public Subscription cancelSubscription(Long subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        subscription.setStatus(Subscription.Status.CANCELED);
        return subscriptionRepository.save(subscription);
    }

    /**
     * Check if user has any valid subscription (active and not expired)
     * This is the main method to check subscription access
     */
    public boolean hasValidSubscription(User user) {
        Optional<Subscription> activeSubscription = getActiveSubscription(user);
        if (activeSubscription.isEmpty()) {
            return false;
        }

        Subscription subscription = activeSubscription.get();
        LocalDateTime now = LocalDateTime.now();

        // Check status and date range
        return subscription.getStatus() == Subscription.Status.ACTIVE &&
               !now.isAfter(subscription.getEndDate()) &&
               !now.isBefore(subscription.getStartDate());
    }

    public Optional<Subscription> findByRazorpayOrderId(String razorpayOrderId) {
        return subscriptionRepository.findByRazorpayOrderId(razorpayOrderId);
    }
} 