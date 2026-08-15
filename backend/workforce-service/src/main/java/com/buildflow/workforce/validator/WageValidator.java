package com.buildflow.workforce.validator;

import com.buildflow.workforce.dto.request.WageCreateRequest;
import com.buildflow.workforce.dto.request.WageUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class WageValidator {

    public void validateCreateRequest(WageCreateRequest request) {
        if (request.getTotalHours().doubleValue() < 0) {
            throw new IllegalArgumentException("Total hours cannot be negative");
        }
    }

    public void validateUpdateRequest(WageUpdateRequest request, com.buildflow.workforce.entity.Wage wage) {
        if (request.getTotalHours() != null && request.getTotalHours().doubleValue() < 0) {
            throw new IllegalArgumentException("Total hours cannot be negative");
        }
    }
}
