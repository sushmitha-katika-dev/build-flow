package com.buildflow.equipment.dto.request;

import com.buildflow.equipment.enums.MaintenanceStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
public class MaintenanceRequest {

    @NotBlank(message = "Description is mandatory")
    private String description;

    @NotNull(message = "Cost is mandatory")
    @DecimalMin(value = "0.0", inclusive = true, message = "Cost must be positive or zero")
    private BigDecimal cost;

    @NotNull(message = "Maintenance date is mandatory")
    private LocalDate maintenanceDate;

    @NotNull(message = "Status is mandatory")
    private MaintenanceStatus status;
}
