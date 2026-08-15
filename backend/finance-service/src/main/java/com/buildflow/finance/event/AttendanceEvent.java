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
public class AttendanceEvent {
    private Long id;
    private Long labourId;
    private Long projectId;
    private LocalDate date;
    private String status;
    private BigDecimal earned;
    private String eventType; // LOGGED, UPDATED, DELETED
}
