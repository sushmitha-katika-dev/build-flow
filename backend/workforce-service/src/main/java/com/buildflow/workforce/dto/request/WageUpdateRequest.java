package com.buildflow.workforce.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class WageUpdateRequest {
    private BigDecimal hourlyRate;
    private BigDecimal totalHours;
    private BigDecimal amountPaid;
    private LocalDate paymentDate;
}
