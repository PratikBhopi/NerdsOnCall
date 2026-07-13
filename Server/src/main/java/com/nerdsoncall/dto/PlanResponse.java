package com.nerdsoncall.dto;

import lombok.Data;

@Data
public class PlanResponse {
    private Long id;
    private String name;
    private Double price;
    private Integer sessionsLimit;
    private String description;
    private Boolean isActive;
    private String duration;
    /** STARTER, PRO, or PREMIUM */
    private String planType;
}
