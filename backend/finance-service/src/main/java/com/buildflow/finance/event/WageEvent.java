package com.buildflow.finance.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WageEvent {
    private Long id;
    private Long labourId;
    private Long agreementId;
    private Long projectId;
    private BigDecimal amountPaid;
    private LocalDate paymentDate;
    private String status;
    private String eventType; // PROCESSED, UPDATED, CANCELLED
}
