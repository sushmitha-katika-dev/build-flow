package com.buildflow.inventory.service;

import com.buildflow.inventory.dto.request.StockRequest;
import com.buildflow.inventory.dto.response.StockResponse;

import java.util.List;

public interface StockService {
    StockResponse initializeOrUpdateStock(StockRequest request);
    StockResponse getStockByMaterialAndProject(Long materialId, Long projectId);
    List<StockResponse> getStockByProjectId(Long projectId);
    void processStockIn(Long materialId, Long projectId, java.math.BigDecimal quantity);
    void processStockOut(Long materialId, Long projectId, java.math.BigDecimal quantity);
}
