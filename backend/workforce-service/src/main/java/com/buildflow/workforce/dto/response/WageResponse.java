package com.buildflow.workforce.dto.response;

import com.buildflow.workforce.enums.WageStatus;
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
    private Long agreementId;
    private BigDecimal amountPaid;
    private LocalDate paymentDate;
    private WageStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
