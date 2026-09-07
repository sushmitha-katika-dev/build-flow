package com.buildflow.finance.event;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class InventoryTransactionEvent {
    private Long id;
    private Long materialId;
    private Long projectId;
    private String transactionType;
    private BigDecimal quantity;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private LocalDateTime transactionDate;
    private String notes;
}
