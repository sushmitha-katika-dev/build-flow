package com.buildflow.workforce.dto.request;

import com.buildflow.workforce.enums.CompensationType;
import com.buildflow.workforce.enums.Gender;
import com.buildflow.workforce.enums.LabourRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LabourCreateRequest {

    @NotBlank(message = "First name cannot be blank")
    private String firstName;

    @NotBlank(message = "Last name cannot be blank")
    private String lastName;

    private String phoneNumber;

    @NotNull(message = "Gender cannot be null")
    private Gender gender;

    @NotNull(message = "Role cannot be null")
    private LabourRole role;

    @NotNull(message = "Compensation type cannot be null")
    private CompensationType compensationType;

    private java.math.BigDecimal dailyRate;
    private java.math.BigDecimal monthlySalary;

    private Long projectId;
}
