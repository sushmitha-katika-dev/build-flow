package com.buildflow.project.dto;

import com.buildflow.project.enums.ProjectStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRequest {

    @NotBlank(message = "Project name cannot be blank")
    private String name;

    @NotBlank(message = "Location cannot be blank")
    private String location;

    @NotNull(message = "Status cannot be null")
    private ProjectStatus status;

    private LocalDate startDate;
    private LocalDate endDate;

    @DecimalMin(value = "0.0", inclusive = false, message = "Budget must be greater than zero")
    private BigDecimal budget;
}
