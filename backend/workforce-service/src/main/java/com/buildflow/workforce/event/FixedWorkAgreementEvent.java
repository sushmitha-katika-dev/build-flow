package com.buildflow.workforce.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FixedWorkAgreementEvent {
    private Long id;
    private Long labourId;
    private Long projectId;
    private BigDecimal agreedAmount;
    private String status;
    private String eventType; // CREATED, UPDATED
}
