package com.buildflow.inventory.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockResponse {
    private Long id;
    private Long materialId;
    private Long projectId;
    private BigDecimal currentStock;
    private BigDecimal reorderLevel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
