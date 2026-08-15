package com.buildflow.workforce.dto.response;

import com.buildflow.workforce.enums.FixedWorkStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FixedWorkAgreementResponse {
    private Long id;
    private Long labourId;
    private Long projectId;
    private String description;
    private BigDecimal agreedAmount;
    private FixedWorkStatus status;
    private com.buildflow.workforce.enums.PaymentStatus paymentStatus;
    private BigDecimal amountPaid;
    private BigDecimal outstandingAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
