package com.buildflow.inventory.validator;

import com.buildflow.inventory.dto.request.SupplierCreateRequest;
import com.buildflow.inventory.dto.request.SupplierUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class SupplierValidator {

    public void validateCreateRequest(SupplierCreateRequest request) {
        // Business validations
    }

    public void validateUpdateRequest(SupplierUpdateRequest request, com.buildflow.inventory.entity.Supplier supplier) {
        // Business validations
    }
}
