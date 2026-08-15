package com.buildflow.finance.dto.request;

import com.buildflow.finance.enums.PaymentStatus;
import com.buildflow.finance.enums.PaymentType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Payment Type is required")
    private PaymentType type;

    @NotNull(message = "Payment Status is required")
    private PaymentStatus status;

    @NotNull(message = "Payment Date is required")
    private LocalDate paymentDate;

    private String description;
}
