package com.buildflow.inventory.dto.request;

import com.buildflow.inventory.enums.MaterialType;
import com.buildflow.inventory.enums.MaterialUnit;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaterialRequest {

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotNull(message = "Type cannot be null")
    private MaterialType type;

    @NotNull(message = "Unit cannot be null")
    private MaterialUnit unit;

    private String specifications;
}
