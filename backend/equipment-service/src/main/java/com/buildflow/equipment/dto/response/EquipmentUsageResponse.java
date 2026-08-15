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
public class EquipmentUsageResponse {
    private Long id;
    private Long equipmentId;
    private Long projectId;
    private LocalDate usageDate;
    private BigDecimal unitsUsed;
    private BigDecimal appliedUnitRate;
    private BigDecimal totalCost;
    private LocalDateTime createdAt;
}
