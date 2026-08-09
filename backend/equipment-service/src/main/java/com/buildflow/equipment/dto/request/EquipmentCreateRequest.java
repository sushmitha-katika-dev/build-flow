package com.buildflow.equipment.dto.request;

import com.buildflow.equipment.enums.EquipmentStatus;
import com.buildflow.equipment.enums.EquipmentType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentCreateRequest {

    @NotBlank(message = "Name is mandatory")
    private String name;

    @NotNull(message = "Type is mandatory")
    private EquipmentType type;

    @NotNull(message = "Status is mandatory")
    private EquipmentStatus status;

    private String registrationNumber;

    private boolean isBulk;

    @NotNull(message = "Total quantity is mandatory")
    @Min(value = 0, message = "Total quantity must be greater than or equal to 0")
    private Integer totalQuantity;
}
