package com.buildflow.project.dto.request;

import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProjectUpdateRequest {

    private String projectName;
    private String description;
    private String clientName;
    private String clientContact;
    private String location;
    private LocalDate expectedEndDate;
    private LocalDate actualEndDate;
    
    @Positive(message = "Estimated budget must be positive")
    private BigDecimal estimatedBudget;
}
