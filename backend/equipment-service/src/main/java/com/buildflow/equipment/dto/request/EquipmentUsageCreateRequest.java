package com.buildflow.equipment.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentUsageCreateRequest {

    @NotNull(message = "Equipment ID is mandatory")
    private Long equipmentId;

    @NotNull(message = "Project ID is mandatory")
    private Long projectId;

    @NotNull(message = "Usage date is mandatory")
    private LocalDate usageDate;

    @NotNull(message = "Units used is mandatory")
    @DecimalMin(value = "0.01", message = "Units used must be greater than 0")
    private BigDecimal unitsUsed;
}
