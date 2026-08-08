package com.buildflow.inventory.validator;

import com.buildflow.inventory.dto.request.PurchaseCreateRequest;
import com.buildflow.inventory.dto.request.PurchaseUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class PurchaseValidator {

    public void validateCreateRequest(PurchaseCreateRequest request) {
        if (request.getQuantity().doubleValue() <= 0) {
            throw new IllegalArgumentException("Quantity must be strictly greater than zero");
        }
    }

    public void validateUpdateRequest(PurchaseUpdateRequest request, com.buildflow.inventory.entity.Purchase purchase) {
        if (request.getQuantity() != null && request.getQuantity().doubleValue() <= 0) {
            throw new IllegalArgumentException("Quantity must be strictly greater than zero");
        }
    }
}
