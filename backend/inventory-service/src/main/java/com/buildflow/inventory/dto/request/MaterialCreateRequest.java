package com.buildflow.inventory.dto.request;

import com.buildflow.inventory.enums.MaterialType;
import com.buildflow.inventory.enums.MaterialUnit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialCreateRequest {

    @NotBlank(message = "Material name cannot be blank")
    private String name;

    private String description;

    @NotNull(message = "Material type cannot be null")
    private MaterialType type;

    @NotNull(message = "Material unit cannot be null")
    private MaterialUnit unit;

    @NotNull(message = "Unit price cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Unit price must be greater than zero")
    private BigDecimal unitPrice;

    private BigDecimal reorderLevel;
}
