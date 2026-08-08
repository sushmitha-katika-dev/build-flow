package com.buildflow.inventory.dto.request;

import com.buildflow.inventory.enums.PurchaseStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequest {

    @NotNull(message = "Material ID cannot be null")
    private Long materialId;

    @NotNull(message = "Supplier ID cannot be null")
    private Long supplierId;

    @NotNull(message = "Quantity cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be greater than zero")
    private BigDecimal quantity;

    @NotNull(message = "Unit price cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Unit price must be greater than zero")
    private BigDecimal unitPrice;

    @NotNull(message = "Purchase date cannot be null")
    private LocalDate purchaseDate;

    @NotNull(message = "Status cannot be null")
    private PurchaseStatus status;
}
