package com.nerdsoncall.service;

import com.nerdsoncall.entity.Subscription;
import com.nerdsoncall.repository.SubscriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SubscriptionSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(SubscriptionSchedulerService.class);

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private SubscriptionService subscriptionService;

    /**
     * Reset daily session usage for all active subscriptions at 12:00 AM every day
     * Cron expression: "0 0 0 * * ?" means:
     * - 0 seconds
     * - 0 minutes
     * - 0 hours (12:00 AM)
     * - every day of month
     * - every month
     * - any day of week
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void resetDailySessionUsage() {
        System.out.println("=== SCHEDULER TRIGGERED ===");
        System.out.println("Starting daily session usage reset at " + LocalDateTime.now());
        logger.info("Starting daily session usage reset at {}", LocalDateTime.now());
        
        try {
            System.out.println("Fetching active subscriptions...");
            List<Subscription> activeSubscriptions = subscriptionRepository.findByStatus(Subscription.Status.ACTIVE);
            System.out.println("Found " + activeSubscriptions.size() + " active subscriptions");

            int resetCount = 0;
            for (Subscription subscription : activeSubscriptions) {
                System.out.println("Processing subscription ID: " + subscription.getId() +
                    ", User: " + subscription.getUser().getEmail() +
                    ", Sessions used: " + subscription.getSessionsUsed());

                if (subscription.getSessionsUsed() != null && subscription.getSessionsUsed() > 0) {
                    int oldUsage = subscription.getSessionsUsed();
                    subscription.setSessionsUsed(0);
                    subscriptionRepository.save(subscription);
                    resetCount++;
                    System.out.println("Reset session usage for user: " + subscription.getUser().getEmail() +
                        " from " + oldUsage + " to 0");
                    logger.info("Reset session usage for user: {} (Subscription ID: {}) from {} to 0",
                        subscription.getUser().getEmail(), subscription.getId(), oldUsage);
                } else {
                    System.out.println("No reset needed for user: " + subscription.getUser().getEmail() +
                        " (sessions used: " + subscription.getSessionsUsed() + ")");
                }
            }

            System.out.println("Daily session usage reset completed. Reset " + resetCount +
                " subscriptions out of " + activeSubscriptions.size() + " active subscriptions");
            logger.info("Daily session usage reset completed. Reset {} subscriptions out of {} active subscriptions",
                resetCount, activeSubscriptions.size());
                
        } catch (Exception e) {
            System.out.println("ERROR during daily session usage reset: " + e.getMessage());
            e.printStackTrace();
            logger.error("Error during daily session usage reset: {}", e.getMessage(), e);
        }
        System.out.println("=== SCHEDULER COMPLETED ===");
    }

    /**
     * Process expired subscriptions every hour
     * Cron expression: "0 0 * * * ?" means:
     * - 0 seconds
     * - 0 minutes
     * - every hour
     * - every day
     * - every month
     * - any day of week
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void processExpiredSubscriptions() {
        logger.info("Starting expired subscription processing at {}", LocalDateTime.now());

        try {
            subscriptionService.processExpiredSubscriptions();
            logger.info("Expired subscription processing completed");
        } catch (Exception e) {
            logger.error("Error during expired subscription processing: {}", e.getMessage(), e);
        }
    }

    /**
     * Clean up old expired subscriptions daily at 2:00 AM
     * Removes expired subscriptions older than 30 days to keep database clean
     * Cron expression: "0 0 2 * * ?" means:
     * - 0 seconds
     * - 0 minutes
     * - 2 hours (2:00 AM)
     * - every day
     * - every month
     * - any day of week
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupOldExpiredSubscriptions() {
        logger.info("Starting cleanup of old expired subscriptions at {}", LocalDateTime.now());

        try {
            subscriptionService.cleanupOldExpiredSubscriptions();
            logger.info("Old expired subscription cleanup completed");
        } catch (Exception e) {
            logger.error("Error during old expired subscription cleanup: {}", e.getMessage(), e);
        }
    }

    /**
     * Log subscription statistics every day at 1:00 AM
     * This helps monitor the system health
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void logSubscriptionStatistics() {
        logger.info("Generating subscription statistics at {}", LocalDateTime.now());
        
        try {
            List<Subscription> activeSubscriptions = subscriptionRepository.findByStatus(Subscription.Status.ACTIVE);
            List<Subscription> expiredSubscriptions = subscriptionRepository.findByStatus(Subscription.Status.EXPIRED);
            List<Subscription> canceledSubscriptions = subscriptionRepository.findByStatus(Subscription.Status.CANCELED);
            
            long totalSessionsUsed = activeSubscriptions.stream()
                .mapToLong(s -> s.getSessionsUsed() != null ? s.getSessionsUsed() : 0)
                .sum();
                
            long totalSessionsLimit = activeSubscriptions.stream()
                .mapToLong(s -> s.getSessionsLimit() != null ? s.getSessionsLimit() : 0)
                .sum();
            
            logger.info("Subscription Statistics:");
            logger.info("- Active subscriptions: {}", activeSubscriptions.size());
            logger.info("- Expired subscriptions: {}", expiredSubscriptions.size());
            logger.info("- Canceled subscriptions: {}", canceledSubscriptions.size());
            logger.info("- Total sessions used today: {}", totalSessionsUsed);
            logger.info("- Total sessions limit: {}", totalSessionsLimit);
            logger.info("- Usage percentage: {}%", 
                totalSessionsLimit > 0 ? (totalSessionsUsed * 100.0 / totalSessionsLimit) : 0);
                
        } catch (Exception e) {
            logger.error("Error during subscription statistics generation: {}", e.getMessage(), e);
        }
    }
}
