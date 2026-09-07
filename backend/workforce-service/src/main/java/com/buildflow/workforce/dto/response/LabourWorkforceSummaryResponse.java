package com.buildflow.workforce.dto.response;

import com.buildflow.workforce.enums.CompensationType;
import com.buildflow.workforce.enums.Gender;
import com.buildflow.workforce.enums.LabourRole;
import com.buildflow.workforce.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabourWorkforceSummaryResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private Gender gender;
    private LabourRole role;
    private Long projectId;
    
    private CompensationType compensationType;
    private BigDecimal dailyRate;
    private BigDecimal monthlySalary;
    
    private BigDecimal daysWorked;
    private BigDecimal totalEarned;
    private BigDecimal amountPaid;
    private BigDecimal remainingAmount;
    private PaymentStatus paymentStatus;
}
