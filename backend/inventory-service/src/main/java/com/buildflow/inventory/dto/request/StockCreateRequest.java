package com.buildflow.inventory.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class StockCreateRequest {

    @NotNull(message = "Material ID cannot be null")
    private Long materialId;

    @NotNull(message = "Project ID cannot be null")
    private Long projectId;

    @NotNull(message = "Quantity cannot be null")
    @DecimalMin(value = "0.0", message = "Quantity cannot be negative")
    private BigDecimal quantity;
}
