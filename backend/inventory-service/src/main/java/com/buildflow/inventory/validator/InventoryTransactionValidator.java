package com.buildflow.inventory.validator;

import com.buildflow.inventory.dto.request.InventoryTransactionCreateRequest;
import org.springframework.stereotype.Component;

@Component
public class InventoryTransactionValidator {

    public void validateCreateRequest(InventoryTransactionCreateRequest request) {
        if (request.getQuantity().doubleValue() <= 0) {
            throw new IllegalArgumentException("Transaction quantity must be strictly greater than zero");
        }
    }
}
