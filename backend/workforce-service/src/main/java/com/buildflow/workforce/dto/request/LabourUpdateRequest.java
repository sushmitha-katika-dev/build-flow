package com.buildflow.workforce.dto.request;

import com.buildflow.workforce.enums.CompensationType;
import com.buildflow.workforce.enums.Gender;
import com.buildflow.workforce.enums.LabourRole;
import com.buildflow.workforce.enums.LabourStatus;
import lombok.Data;

@Data
public class LabourUpdateRequest {
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
}
