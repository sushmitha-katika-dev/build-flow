package com.buildflow.workforce.dto;

import com.buildflow.workforce.enums.WorkerRole;
import com.buildflow.workforce.enums.WorkerStatus;
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
public class WorkerResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private WorkerRole role;
    private Long projectId;
    private BigDecimal hourlyRate;
    private WorkerStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
