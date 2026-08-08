package com.buildflow.inventory.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockRequest {

    @NotNull(message = "Material ID cannot be null")
    private Long materialId;

    private Long projectId;

    @NotNull(message = "Current stock cannot be null")
    @DecimalMin(value = "0.0", message = "Current stock cannot be negative")
    private BigDecimal currentStock;

    @NotNull(message = "Reorder level cannot be null")
    @DecimalMin(value = "0.0", message = "Reorder level cannot be negative")
    private BigDecimal reorderLevel;
}
