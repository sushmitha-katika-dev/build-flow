package com.buildflow.finance.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BudgetRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Estimated Budget is required")
    @Positive(message = "Estimated Budget must be positive")
    private BigDecimal estimatedBudget;
}
