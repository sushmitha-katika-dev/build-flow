package com.buildflow.reporting.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectReportResponse {
    private Long projectId;
    private String projectName;
    private String status;
    private BigDecimal estimatedBudget;
    private LocalDateTime generatedAt;
}
