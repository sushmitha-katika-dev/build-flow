package com.buildflow.inventory.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StockUpdateRequest {
    private BigDecimal quantity;
}
