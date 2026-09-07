package com.buildflow.workforce.validator;

import com.buildflow.workforce.dto.request.WageCreateRequest;
import com.buildflow.workforce.dto.request.WageUpdateRequest;
import com.buildflow.workforce.entity.Wage;
import org.springframework.stereotype.Component;

@Component
public class WageValidator {

    public void validateCreateRequest(WageCreateRequest request) {
        if (request.getAmountPaid().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount paid must be greater than zero");
        }
    }

    public void validateUpdateRequest(WageUpdateRequest request, Wage wage) {
        if (request.getAmountPaid() != null && request.getAmountPaid().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount paid must be greater than zero");
        }
    }
}
