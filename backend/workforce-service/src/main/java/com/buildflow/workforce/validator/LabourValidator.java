package com.buildflow.workforce.validator;

import com.buildflow.workforce.dto.request.LabourCreateRequest;
import com.buildflow.workforce.dto.request.LabourUpdateRequest;
import com.buildflow.workforce.enums.CompensationType;
import org.springframework.stereotype.Component;

@Component
public class LabourValidator {

    public void validateCreateRequest(LabourCreateRequest request) {
        // Daily rate is optional during creation as rates can be logged per attendance
    }

    public void validateUpdateRequest(LabourUpdateRequest request, com.buildflow.workforce.entity.Labour labour) {
        // Daily rate is optional during update
    }
}
