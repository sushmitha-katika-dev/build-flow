package com.buildflow.workforce.dto.response;

import com.buildflow.workforce.enums.CompensationType;
import com.buildflow.workforce.enums.Gender;
import com.buildflow.workforce.enums.LabourRole;
import com.buildflow.workforce.enums.LabourStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabourResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Gender gender;
    private LabourRole role;
    private CompensationType compensationType;
    private java.math.BigDecimal dailyRate;
    private java.math.BigDecimal monthlySalary;
    private Long projectId;
    private LabourStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
