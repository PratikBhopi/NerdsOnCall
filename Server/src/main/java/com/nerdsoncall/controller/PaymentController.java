package com.nerdsoncall.controller;

import com.nerdsoncall.entity.Subscription;
import com.nerdsoncall.entity.User;
import com.nerdsoncall.service.EmailService;
import com.nerdsoncall.service.PaymentService;
import com.nerdsoncall.service.SubscriptionService;
import com.nerdsoncall.service.UserService;
import com.nerdsoncall.subscription.SubscriptionPlan;
import com.nerdsoncall.subscription.SubscriptionPlanCatalog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;
    @Autowired
    private UserService userService;
    @Autowired
    private SubscriptionService subscriptionService;
    @Autowired
    private EmailService emailService;

    @PostMapping("/verify")
    public ResponseEntity<?> verifyRazorpayPayment(
            @RequestParam String orderId,
            @RequestParam String paymentId,
            @RequestParam String signature,
            @RequestParam Long planId,
            @RequestParam String userEmail) {

        boolean isValid = paymentService.verifyOrder(orderId, paymentId, signature);
        if (!isValid) {
            return ResponseEntity.badRequest().body("Payment verification failed");
        }

        Subscription subscription = subscriptionService.findByRazorpayOrderId(orderId).orElse(null);
        if (subscription == null) {
            return ResponseEntity.badRequest().body("Subscription not found for this order");
        }

        subscription.setStatus(Subscription.Status.ACTIVE);
        LocalDateTime startDate = LocalDateTime.now();
        subscription.setStartDate(startDate);

        SubscriptionPlan plan = SubscriptionPlanCatalog.findById(planId)
                .or(() -> SubscriptionPlanCatalog.findByPlanType(subscription.getPlanType()))
                .orElse(SubscriptionPlanCatalog.STARTER);

        subscription.setEndDate(SubscriptionController.endDateForPlan(plan, startDate));
        subscriptionService.saveSubscription(subscription);

        userService.findByEmail(userEmail).ifPresent(user -> {
            String userName = user.getFirstName()
                    + (user.getLastName() != null ? (" " + user.getLastName()) : "");
            try {
                emailService.sendSubscriptionReceiptWithPdf(
                        userEmail,
                        userName,
                        user,
                        subscription
                );
            } catch (jakarta.mail.MessagingException | IOException e) {
                System.err.println("Failed to send subscription receipt email: " + e.getMessage());
            }
        });

        return ResponseEntity.ok(subscription);
    }
}
