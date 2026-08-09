package com.buildflow.reporting.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportFilterRequest {
    private Long projectId;
    private LocalDate startDate;
    private LocalDate endDate;
}
