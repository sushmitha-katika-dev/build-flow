package com.buildflow.equipment.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FuelRecordRequest {

    @NotNull(message = "Project ID is mandatory")
    private Long projectId;

    @NotNull(message = "Date is mandatory")
    private LocalDate date;

    @NotNull(message = "Quantity in liters is mandatory")
    @DecimalMin(value = "0.01", inclusive = true, message = "Quantity must be greater than zero")
    private BigDecimal quantityInLiters;

    @NotNull(message = "Total cost is mandatory")
    @DecimalMin(value = "0.0", inclusive = true, message = "Total cost must be positive or zero")
    private BigDecimal totalCost;
}
