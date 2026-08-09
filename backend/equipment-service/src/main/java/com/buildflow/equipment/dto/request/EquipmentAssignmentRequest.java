package com.buildflow.equipment.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentAssignmentRequest {

    @NotNull(message = "Project ID is mandatory")
    private Long projectId;

    @NotNull(message = "Assigned quantity is mandatory")
    @Min(value = 1, message = "Assigned quantity must be at least 1")
    private Integer assignedQuantity;

    @NotNull(message = "Assignment date is mandatory")
    private LocalDate assignmentDate;
    
    private LocalDate returnDate;
}
