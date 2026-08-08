package com.buildflow.inventory.dto.response;

import com.buildflow.inventory.enums.MaterialType;
import com.buildflow.inventory.enums.MaterialUnit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialResponse {
    private Long id;
    private String name;
    private MaterialType type;
    private MaterialUnit unit;
    private String specifications;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
