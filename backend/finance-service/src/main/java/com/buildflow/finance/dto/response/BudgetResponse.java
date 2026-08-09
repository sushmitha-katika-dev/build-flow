package com.buildflow.finance.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BudgetResponse {
    private Long id;
    private Long projectId;
    private BigDecimal estimatedBudget;
    private BigDecimal actualExpenses;
    private BigDecimal remainingBudget;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
