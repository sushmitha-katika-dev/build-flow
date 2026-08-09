package com.buildflow.finance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfitLossResponse {
    private Long projectId;
    private BigDecimal totalEstimatedBudget;
    private BigDecimal totalExpenses;
    private BigDecimal totalPaymentsReceived;
    private BigDecimal netProfitOrLoss;
    private String status; // PROFIT, LOSS, BREAK_EVEN
}
