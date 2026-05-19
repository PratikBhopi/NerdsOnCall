package com.nerdsoncall.controller;

import com.nerdsoncall.entity.Subscription;
import com.nerdsoncall.entity.User;
import com.nerdsoncall.service.PaymentService;
import com.nerdsoncall.service.PlanService;
import com.nerdsoncall.service.SubscriptionService;
import com.nerdsoncall.service.UserService;
import com.nerdsoncall.subscription.SubscriptionPlan;
import com.razorpay.Order;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/subscriptions")
@CrossOrigin(origins = "*")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private UserService userService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PlanService planService;

    @GetMapping("/my-subscription")
    public ResponseEntity<?> getMySubscription(Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            java.util.Optional<Subscription> subscription = subscriptionService.getActiveSubscription(user);
            if (subscription.isPresent()) {
                return ResponseEntity.ok(subscription.get());
            } else {
                return ResponseEntity.ok("No active subscription");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get subscription: " + e.getMessage());
        }
    }

    @GetMapping("/session-status")
    public ResponseEntity<?> getSessionStatus(Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getRole() != User.Role.STUDENT) {
                Map<String, Object> response = new HashMap<>();
                response.put("hasActiveSubscription", false);
                response.put("message", "Only students have session limits");
                return ResponseEntity.ok(response);
            }

            java.util.Optional<Subscription> activeSubscription = subscriptionService.getActiveSubscription(user);

            if (!activeSubscription.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("hasActiveSubscription", false);
                response.put("message", "No active subscription found");
                return ResponseEntity.ok(response);
            }

            Subscription subscription = activeSubscription.get();
            Map<String, Object> response = new HashMap<>();

            int sessionsUsed = subscription.getSessionsUsed() != null ? subscription.getSessionsUsed() : 0;
            int sessionsLimit = subscription.getSessionsLimit() != null ? subscription.getSessionsLimit() : 0;

            response.put("hasActiveSubscription", true);
            response.put("sessionsUsed", sessionsUsed);
            response.put("sessionsLimit", sessionsLimit);
            response.put("sessionsRemaining", Math.max(0, sessionsLimit - sessionsUsed));
            response.put("canAskDoubt", sessionsUsed < sessionsLimit);
            response.put("canStartVideoCall", sessionsUsed < sessionsLimit);
            response.put("planName", subscription.getPlanName() != null ? subscription.getPlanName() : "Unknown Plan");
            response.put("planType", subscription.getPlanType() != null ? subscription.getPlanType() : "UNKNOWN");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("hasActiveSubscription", false);
            errorResponse.put("message", "Error retrieving session status: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getSubscriptionHistory(Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Subscription> subscriptions = subscriptionService.getSubscriptionsByUser(user);
            return ResponseEntity.ok(subscriptions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get subscription history: " + e.getMessage());
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> createCheckoutOrder(
            @RequestParam Long planId,
            Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getRole() != User.Role.STUDENT) {
                return ResponseEntity.badRequest().body("Only students can subscribe");
            }

            SubscriptionPlan plan = planService.getPlanById(planId)
                    .orElseThrow(() -> new RuntimeException("Plan not found"));

            double priceInINR = plan.priceInr();
            long amount = (long) (priceInINR * 100);
            String currency = "INR";
            String receipt = "receipt_" + user.getId() + "_" + System.currentTimeMillis();
            Order order = paymentService.createOrder(amount, currency, receipt);

            LocalDateTime startDate = LocalDateTime.now();
            LocalDateTime endDate = endDateForPlan(plan, startDate);

            Subscription subscription = new Subscription();
            subscription.setUser(user);
            subscription.setStatus(Subscription.Status.PENDING);
            subscription.setPrice(priceInINR);
            subscription.setStartDate(startDate);
            subscription.setEndDate(endDate);
            subscription.setSessionsLimit(plan.dailyDoubtLimit());
            subscription.setSessionsUsed(0);
            subscription.setPlanName(plan.name());
            subscription.setPlanType(plan.planType());
            subscription.setRazorpayOrderId((String) order.get("id"));
            subscriptionService.saveSubscription(subscription);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("key", paymentService.getRazorpayKeyId());
            response.put("name", plan.name());
            response.put("description", plan.description());
            response.put("userEmail", user.getEmail());
            response.put("planId", plan.id());
            return ResponseEntity.ok(response);
        } catch (RazorpayException e) {
            return ResponseEntity.badRequest().body("Failed to create Razorpay order: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create checkout order: " + e.getMessage());
        }
    }

    @PostMapping("/cancel/{id}")
    public ResponseEntity<?> cancelSubscription(@PathVariable Long id, Authentication authentication) {
        try {
            Subscription cancelledSubscription = subscriptionService.cancelSubscription(id);
            return ResponseEntity.ok(cancelledSubscription);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to cancel subscription: " + e.getMessage());
        }
    }

    @GetMapping("/can-create-session")
    public ResponseEntity<?> canCreateSession(Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            boolean canCreate = subscriptionService.canUserCreateSession(user);
            return ResponseEntity.ok(canCreate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to check session eligibility: " + e.getMessage());
        }
    }

    static LocalDateTime endDateForPlan(SubscriptionPlan plan, LocalDateTime startDate) {
        return switch (plan.duration()) {
            case MONTHLY -> startDate.plusMonths(1);
            case QUARTERLY -> startDate.plusMonths(3);
            case YEARLY -> startDate.plusYears(1);
        };
    }
}
