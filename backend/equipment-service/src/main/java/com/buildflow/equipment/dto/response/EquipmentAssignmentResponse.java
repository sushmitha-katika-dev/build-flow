package com.buildflow.equipment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentAssignmentResponse {
    private Long id;
    private Long equipmentId;
    private Long projectId;
    private Integer assignedQuantity;
    private LocalDate assignmentDate;
    private LocalDate returnDate;
    private java.math.BigDecimal agreedUnitRate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
