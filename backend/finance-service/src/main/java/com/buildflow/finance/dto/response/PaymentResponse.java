package com.buildflow.finance.dto.response;

import com.buildflow.finance.enums.PaymentStatus;
import com.buildflow.finance.enums.PaymentType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class PaymentResponse {
    private Long id;
    private Long projectId;
    private BigDecimal amount;
    private PaymentType type;
    private PaymentStatus status;
    private LocalDate paymentDate;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
