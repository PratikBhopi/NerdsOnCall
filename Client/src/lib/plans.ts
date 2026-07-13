import type { Plan } from "@/types";

/**
 * Fixed subscription plans — must stay in sync with
 * Server/src/main/java/com/nerdsoncall/subscription/SubscriptionPlanCatalog.java
 */
export const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: 1,
    name: "Starter Plan",
    price: 499,
    sessionsLimit: 10,
    description: "10 daily doubt requests",
    duration: "MONTHLY",
    planType: "STARTER",
    isActive: true,
  },
  {
    id: 2,
    name: "Pro Plan",
    price: 1999,
    sessionsLimit: 20,
    description: "20 daily doubt requests",
    duration: "QUARTERLY",
    planType: "PRO",
    isActive: true,
  },
  {
    id: 3,
    name: "Premium Plan",
    price: 5999,
    sessionsLimit: 30,
    description: "30 daily doubt requests",
    duration: "YEARLY",
    planType: "PREMIUM",
    isActive: true,
  },
];

export function getPlanFeatures(plan: Plan): string[] {
  return [
    `${plan.sessionsLimit} daily doubt requests`,
    "Live video sessions with tutors",
    "Shared whiteboard",
    "Screen sharing",
  ];
}

export function isPopularPlan(plan: Plan): boolean {
  return plan.planType === "PRO";
}
