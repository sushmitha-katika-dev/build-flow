package com.buildflow.finance.dto.response;

import com.buildflow.finance.enums.ExpenseCategory;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ExpenseResponse {
    private Long id;
    private Long projectId;
    private BigDecimal amount;
    private ExpenseCategory category;
    private LocalDate date;
    private String description;
    private String referenceId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
