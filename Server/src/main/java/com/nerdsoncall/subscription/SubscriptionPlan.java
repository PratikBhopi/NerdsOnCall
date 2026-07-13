package com.nerdsoncall.subscription;

/**
 * In-code subscription plan definition (not persisted).
 */
public record SubscriptionPlan(
        long id,
        String name,
        double priceInr,
        int dailyDoubtLimit,
        String description,
        Duration duration,
        String planType
) {
    public enum Duration {
        MONTHLY,
        QUARTERLY,
        YEARLY
    }
}
