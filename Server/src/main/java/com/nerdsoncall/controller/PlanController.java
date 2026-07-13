package com.nerdsoncall.controller;

import com.nerdsoncall.service.PlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/plans")
@CrossOrigin(origins = "*")
public class PlanController {

    @Autowired
    private PlanService planService;

    /** Returns the fixed in-code subscription plans. */
    @GetMapping
    public ResponseEntity<?> getAllPlans() {
        return ResponseEntity.ok(planService.getAllPlans());
    }
}
