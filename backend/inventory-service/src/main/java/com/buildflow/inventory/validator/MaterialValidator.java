package com.buildflow.inventory.validator;

import com.buildflow.inventory.dto.request.MaterialCreateRequest;
import com.buildflow.inventory.dto.request.MaterialUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class MaterialValidator {

    public void validateCreateRequest(MaterialCreateRequest request) {
    }

    public void validateUpdateRequest(MaterialUpdateRequest request, com.buildflow.inventory.entity.Material material) {
    }
}
