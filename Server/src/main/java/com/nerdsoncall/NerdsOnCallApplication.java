package com.nerdsoncall;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.beans.factory.annotation.Autowired;
import com.nerdsoncall.service.SessionService;
import com.nerdsoncall.repository.PlanRepository;
import com.nerdsoncall.entity.Plan;
import org.springframework.stereotype.Component;

import java.util.List;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class NerdsOnCallApplication {
    public static void main(String[] args) {
        // Load environment variables from .env file
        SpringApplication application = new SpringApplication(NerdsOnCallApplication.class);
        application.run(args);
    }
}

@Component
class DatabaseSchemaUpdater {
    @Autowired
    private SessionService sessionService;

    @Autowired
    private PlanRepository planRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void updateDatabaseSchema() {
        // Update database schema on startup
        sessionService.updateDatabaseSchema();
        seedPlans();
    }

    private void seedPlans() {
        if (planRepository.count() == 0) {
            Plan starter = new Plan();
            starter.setName("Starter");
            starter.setPrice(199.0);
            starter.setSessionsLimit(10);
            starter.setDescription("Perfect for students with occasional doubts. Includes 10 sessions per month.");
            starter.setDuration(Plan.DurationType.MONTHLY);
            starter.setIsActive(true);

            Plan pro = new Plan();
            pro.setName("Pro");
            pro.setPrice(499.0);
            pro.setSessionsLimit(30);
            pro.setDescription("Standard plan for active learners. Includes 30 sessions per month.");
            pro.setDuration(Plan.DurationType.MONTHLY);
            pro.setIsActive(true);

            Plan unlimited = new Plan();
            unlimited.setName("Unlimited");
            unlimited.setPrice(2499.0);
            unlimited.setSessionsLimit(100);
            unlimited.setDescription("Premium support for serious academics. Includes 100 sessions per month.");
            unlimited.setDuration(Plan.DurationType.MONTHLY);
            unlimited.setIsActive(true);

            planRepository.saveAll(List.of(starter, pro, unlimited));
            System.out.println("✅ Subscription plans seeded successfully!");
        } else {
            System.out.println("ℹ️ Subscription plans already exist, skipping seeding.");
        }
    }
}