package com.buildflow.inventory.dto.request;

import com.buildflow.inventory.enums.MaterialType;
import com.buildflow.inventory.enums.MaterialUnit;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialUpdateRequest {
    private String name;
    private String description;
    private MaterialType type;
    private MaterialUnit unit;
    private BigDecimal unitPrice;
    private BigDecimal reorderLevel;
}
