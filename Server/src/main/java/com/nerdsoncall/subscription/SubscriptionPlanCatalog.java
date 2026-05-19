package com.nerdsoncall.subscription;

import java.util.List;
import java.util.Optional;

/**
 * Fixed subscription plans for NerdsOnCall.
 */
public final class SubscriptionPlanCatalog {

    public static final SubscriptionPlan STARTER = new SubscriptionPlan(
            1L,
            "Starter Plan",
            499.0,
            10,
            "10 daily doubt requests",
            SubscriptionPlan.Duration.MONTHLY,
            "STARTER"
    );

    public static final SubscriptionPlan PRO = new SubscriptionPlan(
            2L,
            "Pro Plan",
            1999.0,
            20,
            "20 daily doubt requests",
            SubscriptionPlan.Duration.QUARTERLY,
            "PRO"
    );

    public static final SubscriptionPlan PREMIUM = new SubscriptionPlan(
            3L,
            "Premium Plan",
            5999.0,
            30,
            "30 daily doubt requests",
            SubscriptionPlan.Duration.YEARLY,
            "PREMIUM"
    );

    private static final List<SubscriptionPlan> ALL = List.of(STARTER, PRO, PREMIUM);

    private SubscriptionPlanCatalog() {
    }

    public static List<SubscriptionPlan> all() {
        return ALL;
    }

    public static Optional<SubscriptionPlan> findById(long id) {
        return ALL.stream().filter(p -> p.id() == id).findFirst();
    }

    public static Optional<SubscriptionPlan> findByPlanType(String planType) {
        if (planType == null) {
            return Optional.empty();
        }
        return ALL.stream()
                .filter(p -> p.planType().equalsIgnoreCase(planType))
                .findFirst();
    }
}
