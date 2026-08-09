package com.buildflow.equipment.dto.response;

import com.buildflow.equipment.enums.EquipmentStatus;
import com.buildflow.equipment.enums.EquipmentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentResponse {
    private Long id;
    private String name;
    private EquipmentType type;
    private EquipmentStatus status;
    private String registrationNumber;
    private boolean isBulk;
    private Integer totalQuantity;
    private Integer availableQuantity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
