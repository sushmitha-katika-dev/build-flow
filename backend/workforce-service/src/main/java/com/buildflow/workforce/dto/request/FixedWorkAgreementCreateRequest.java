package com.buildflow.workforce.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FixedWorkAgreementCreateRequest {

    @NotNull(message = "Labour ID is required")
    private Long labourId;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotBlank(message = "Work description is required")
    private String description;

    @NotNull(message = "Agreed amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Agreed amount must be greater than zero")
    private BigDecimal agreedAmount;
}
