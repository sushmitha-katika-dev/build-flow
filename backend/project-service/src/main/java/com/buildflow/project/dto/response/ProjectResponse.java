package com.buildflow.project.dto.response;

import com.buildflow.project.enums.ProjectStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ProjectResponse {
    private Long id;
    private String projectCode;
    private String projectName;
    private String description;
    private String clientName;
    private String clientContact;
    private String location;
    private LocalDate startDate;
    private LocalDate expectedEndDate;
    private LocalDate actualEndDate;
    private BigDecimal estimatedBudget;
    private ProjectStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
