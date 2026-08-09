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
public class FinancialReportResponse {
    private Long projectId;
    private BigDecimal totalExpenses;
    private BigDecimal totalPaymentsReceived;
    private BigDecimal currentProfitOrLoss;
    private String financialStatus; // PROFIT, LOSS, BREAK_EVEN
    private LocalDateTime generatedAt;
}
