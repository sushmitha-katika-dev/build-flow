package com.buildflow.workforce.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FixedWorkAgreementUpdateRequest {

    @NotBlank(message = "Description cannot be blank")
    private String description;

    @NotNull(message = "Agreed amount cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Agreed amount must be greater than zero")
    private BigDecimal agreedAmount;
}
