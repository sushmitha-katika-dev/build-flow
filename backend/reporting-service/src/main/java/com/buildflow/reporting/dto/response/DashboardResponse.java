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
public class DashboardResponse {
    private Integer activeProjectsCount;
    private Integer lowStockAlertsCount;
    private BigDecimal totalCompanyRevenue;
    private BigDecimal totalCompanyExpenses;
    private BigDecimal netProfitOrLoss;
    private LocalDateTime generatedAt;
}
