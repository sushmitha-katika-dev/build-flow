package com.buildflow.equipment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FuelRecordResponse {
    private Long id;
    private Long equipmentId;
    private Long projectId;
    private LocalDate date;
    private BigDecimal quantityInLiters;
    private BigDecimal totalCost;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
