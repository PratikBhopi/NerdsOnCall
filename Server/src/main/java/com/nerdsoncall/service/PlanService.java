package com.nerdsoncall.service;

import com.nerdsoncall.dto.PlanResponse;
import com.nerdsoncall.subscription.SubscriptionPlan;
import com.nerdsoncall.subscription.SubscriptionPlanCatalog;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlanService {

    public List<PlanResponse> getAllPlans() {
        return SubscriptionPlanCatalog.all().stream().map(this::toResponse).toList();
    }

    public Optional<PlanResponse> getPlan(Long id) {
        return SubscriptionPlanCatalog.findById(id).map(this::toResponse);
    }

    public Optional<SubscriptionPlan> getPlanById(long id) {
        return SubscriptionPlanCatalog.findById(id);
    }

    private PlanResponse toResponse(SubscriptionPlan plan) {
        PlanResponse resp = new PlanResponse();
        resp.setId(plan.id());
        resp.setName(plan.name());
        resp.setPrice(plan.priceInr());
        resp.setSessionsLimit(plan.dailyDoubtLimit());
        resp.setDescription(plan.description());
        resp.setIsActive(true);
        resp.setDuration(plan.duration().name());
        resp.setPlanType(plan.planType());
        return resp;
    }
}
