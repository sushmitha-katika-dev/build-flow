package com.buildflow.workforce.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WageRequest {

    @NotNull(message = "Labour ID cannot be null")
    private Long labourId;

    @NotNull(message = "Project ID cannot be null")
    private Long projectId;

    @NotNull(message = "Hourly rate cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Hourly rate must be greater than zero")
    private BigDecimal hourlyRate;

    @NotNull(message = "Total hours cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Total hours must be greater than zero")
    private BigDecimal totalHours;

    @NotNull(message = "Amount paid cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount paid must be greater than zero")
    private BigDecimal amountPaid;

    @NotNull(message = "Payment date cannot be null")
    private LocalDate paymentDate;
}
