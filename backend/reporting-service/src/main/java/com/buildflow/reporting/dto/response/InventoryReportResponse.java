package com.buildflow.reporting.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryReportResponse {
    private Long materialId;
    private String materialName;
    private Integer totalQuantityAvailable;
    private Boolean isLowStock;
    private LocalDateTime generatedAt;
}
