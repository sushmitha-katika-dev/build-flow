package com.buildflow.equipment.dto.response;

import com.buildflow.equipment.enums.EquipmentStatus;
import com.buildflow.equipment.enums.EquipmentType;
import com.buildflow.equipment.enums.OwnershipType;
import com.buildflow.equipment.enums.UsageUnit;
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
public class EquipmentResponse {
    private Long id;
    private String name;
    private EquipmentType type;
    private EquipmentStatus status;
    private String registrationNumber;
    @com.fasterxml.jackson.annotation.JsonProperty("isBulk")
    private boolean isBulk;

    @com.fasterxml.jackson.annotation.JsonProperty("isBulk")
    public boolean getIsBulk() {
        return isBulk;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("isBulk")
    public boolean isBulk() {
        return isBulk;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("isBulk")
    public void setIsBulk(boolean isBulk) {
        this.isBulk = isBulk;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("isBulk")
    public void setBulk(boolean isBulk) {
        this.isBulk = isBulk;
    }
    private Integer totalQuantity;
    private Integer availableQuantity;
    private OwnershipType ownershipType;
    private UsageUnit usageUnit;
    private BigDecimal unitRate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
