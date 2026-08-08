package com.buildflow.workforce.dto;

import com.buildflow.workforce.enums.WorkerRole;
import com.buildflow.workforce.enums.WorkerStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkerRequest {

    @NotBlank(message = "First name cannot be blank")
    private String firstName;

    @NotBlank(message = "Last name cannot be blank")
    private String lastName;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email cannot be blank")
    private String email;

    @NotBlank(message = "Phone number cannot be blank")
    private String phoneNumber;

    @NotNull(message = "Role cannot be null")
    private WorkerRole role;

    private Long projectId;

    @DecimalMin(value = "0.0", inclusive = false, message = "Hourly rate must be greater than zero")
    private BigDecimal hourlyRate;

    @NotNull(message = "Status cannot be null")
    private WorkerStatus status;
}
