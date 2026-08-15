package com.buildflow.inventory.validator;

import com.buildflow.inventory.dto.request.StockCreateRequest;
import com.buildflow.inventory.dto.request.StockUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class StockValidator {

    public void validateCreateRequest(StockCreateRequest request) {
        if (request.getQuantity().doubleValue() < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative");
        }
    }

    public void validateUpdateRequest(StockUpdateRequest request, com.buildflow.inventory.entity.Stock stock) {
        if (request.getQuantity() != null && request.getQuantity().doubleValue() < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative");
        }
    }
}
