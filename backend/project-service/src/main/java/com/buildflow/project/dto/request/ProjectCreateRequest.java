package com.buildflow.project.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProjectCreateRequest {

    @NotBlank(message = "Project name is required")
    private String projectName;

    private String description;

    @NotBlank(message = "Client name is required")
    private String clientName;

    private String clientContact;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "Expected end date is required")
    private LocalDate expectedEndDate;

    @Positive(message = "Estimated budget must be positive")
    private BigDecimal estimatedBudget;
}
