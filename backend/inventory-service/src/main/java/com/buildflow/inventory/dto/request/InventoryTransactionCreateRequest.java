package com.buildflow.inventory.dto.request;

import com.buildflow.inventory.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class InventoryTransactionCreateRequest {

    @NotNull(message = "Material ID cannot be null")
    private Long materialId;

    private Long projectId;

    @NotNull(message = "Transaction type cannot be null")
    private TransactionType transactionType;

    @NotNull(message = "Quantity cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be greater than zero")
    private BigDecimal quantity;

    @NotNull(message = "Transaction date cannot be null")
    private LocalDateTime transactionDate;

    private String notes;
}
