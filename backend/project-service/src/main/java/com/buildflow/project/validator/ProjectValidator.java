package com.buildflow.project.validator;

import com.buildflow.project.dto.request.ProjectCreateRequest;
import com.buildflow.project.dto.request.ProjectUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class ProjectValidator {

    public void validateCreateRequest(ProjectCreateRequest request) {
        if (request.getExpectedEndDate() != null && request.getStartDate() != null) {
            if (request.getExpectedEndDate().isBefore(request.getStartDate())) {
                throw new IllegalArgumentException("Expected end date cannot be before start date");
            }
        }
    }

    public void validateUpdateRequest(ProjectUpdateRequest request, com.buildflow.project.entity.Project project) {
        if (request.getExpectedEndDate() != null && project.getStartDate() != null) {
            if (request.getExpectedEndDate().isBefore(project.getStartDate())) {
                throw new IllegalArgumentException("Expected end date cannot be before start date");
            }
        }
    }
}
