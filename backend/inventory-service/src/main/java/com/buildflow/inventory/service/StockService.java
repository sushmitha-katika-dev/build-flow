package com.buildflow.inventory.service;

import com.buildflow.inventory.dto.request.StockCreateRequest;
import com.buildflow.inventory.dto.request.StockUpdateRequest;
import com.buildflow.inventory.dto.response.StockResponse;

import java.math.BigDecimal;
import java.util.List;

public interface StockService {
    StockResponse initializeStock(StockCreateRequest request);
    StockResponse getStockById(Long id);
    List<StockResponse> getStockByProject(Long projectId);
    StockResponse getStockByMaterialAndProject(Long materialId, Long projectId);
    StockResponse updateStock(Long id, StockUpdateRequest request);
    void processStockIn(Long materialId, Long projectId, BigDecimal quantity);
    void processStockOut(Long materialId, Long projectId, BigDecimal quantity);
}
