package com.buildflow.inventory.dto.request;

import com.buildflow.inventory.enums.PurchaseStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PurchaseUpdateRequest {
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalCost;
    private LocalDate expectedDeliveryDate;
    private LocalDate actualDeliveryDate;
    private PurchaseStatus status;
}
