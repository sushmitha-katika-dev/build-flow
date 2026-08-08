package com.buildflow.workforce.validator;

import com.buildflow.workforce.dto.request.LabourCreateRequest;
import com.buildflow.workforce.dto.request.LabourUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class LabourValidator {

    public void validateCreateRequest(LabourCreateRequest request) {
        // Add specific business validations here if needed
    }

    public void validateUpdateRequest(LabourUpdateRequest request, com.buildflow.workforce.entity.Labour labour) {
        // Add specific business validations here if needed
    }
}
