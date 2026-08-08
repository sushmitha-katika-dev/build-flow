package com.buildflow.workforce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WageResponse {
    private Long id;
    private Long labourId;
    private Long projectId;
    private BigDecimal hourlyRate;
    private BigDecimal totalHours;
    private BigDecimal amountPaid;
    private LocalDate paymentDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
