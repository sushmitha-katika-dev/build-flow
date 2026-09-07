package com.buildflow.workforce.dto.request;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class WageUpdateRequest {
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount paid must be greater than zero")
    private BigDecimal amountPaid;
    private LocalDate paymentDate;
}
