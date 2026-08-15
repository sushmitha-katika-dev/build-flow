package com.buildflow.workforce.validator;

import com.buildflow.workforce.dto.request.LabourCreateRequest;
import com.buildflow.workforce.dto.request.LabourUpdateRequest;
import com.buildflow.workforce.enums.CompensationType;
import org.springframework.stereotype.Component;

@Component
public class LabourValidator {

    public void validateCreateRequest(LabourCreateRequest request) {
        validateCompensationFields(request.getCompensationType(), request.getDailyRate(), request.getMonthlySalary());
    }

    public void validateUpdateRequest(LabourUpdateRequest request, com.buildflow.workforce.entity.Labour labour) {
        CompensationType type = request.getCompensationType() != null ? request.getCompensationType() : labour.getCompensationType();
        java.math.BigDecimal dailyRate = request.getDailyRate() != null ? request.getDailyRate() : labour.getDailyRate();
        java.math.BigDecimal monthlySalary = request.getMonthlySalary() != null ? request.getMonthlySalary() : labour.getMonthlySalary();
        validateCompensationFields(type, dailyRate, monthlySalary);
    }

    private void validateCompensationFields(CompensationType type, java.math.BigDecimal dailyRate, java.math.BigDecimal monthlySalary) {
        if (type == CompensationType.DAILY && dailyRate == null) {
            throw new IllegalArgumentException("Daily rate is required for DAILY compensation type");
        }
        if (type == CompensationType.MONTHLY && monthlySalary == null) {
            throw new IllegalArgumentException("Monthly salary is required for MONTHLY compensation type");
        }
    }
}
