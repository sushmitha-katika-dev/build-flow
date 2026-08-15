package com.buildflow.inventory.validator;

import com.buildflow.inventory.dto.request.MaterialCreateRequest;
import com.buildflow.inventory.dto.request.MaterialUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class MaterialValidator {

    public void validateCreateRequest(MaterialCreateRequest request) {
        if (request.getUnitPrice().doubleValue() <= 0) {
            throw new IllegalArgumentException("Unit price must be strictly greater than zero");
        }
    }

    public void validateUpdateRequest(MaterialUpdateRequest request, com.buildflow.inventory.entity.Material material) {
        if (request.getUnitPrice() != null && request.getUnitPrice().doubleValue() <= 0) {
            throw new IllegalArgumentException("Unit price must be strictly greater than zero");
        }
    }
}
