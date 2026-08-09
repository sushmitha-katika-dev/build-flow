package com.buildflow.reporting.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkforceReportResponse {
    private Long projectId;
    private Integer totalWorkersAssigned;
    private Integer workersPresentToday;
    private Double attendancePercentage;
    private LocalDateTime generatedAt;
}
