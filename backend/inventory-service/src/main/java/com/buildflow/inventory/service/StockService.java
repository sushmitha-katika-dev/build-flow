package com.buildflow.inventory.service;

import com.buildflow.inventory.dto.request.StockCreateRequest;
import com.buildflow.inventory.dto.request.StockUpdateRequest;
import com.buildflow.inventory.dto.response.StockResponse;
import com.buildflow.inventory.entity.Stock;

import java.math.BigDecimal;
import java.util.List;

public interface StockService {
    StockResponse initializeStock(StockCreateRequest request);
    StockResponse getStockById(Long id);
    List<StockResponse> getStockByProject(Long projectId);
    StockResponse getStockByMaterialAndProjectAndVariant(Long materialId, Long projectId, String variant);
    StockResponse updateStock(Long id, StockUpdateRequest request);
    Stock processStockIn(Long materialId, Long projectId, String variant, BigDecimal quantity, BigDecimal unitCost);
    Stock processStockOut(Long materialId, Long projectId, String variant, BigDecimal quantity);
}
