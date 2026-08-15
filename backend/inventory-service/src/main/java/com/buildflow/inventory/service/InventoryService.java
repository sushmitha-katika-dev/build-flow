package com.buildflow.inventory.service;

import com.buildflow.inventory.dto.request.InventoryTransactionCreateRequest;
import com.buildflow.inventory.dto.response.InventoryTransactionResponse;

import java.util.List;

public interface InventoryService {
    InventoryTransactionResponse recordTransaction(InventoryTransactionCreateRequest request);
    List<InventoryTransactionResponse> getTransactionsByMaterialId(Long materialId);
    List<InventoryTransactionResponse> getTransactionsByProjectId(Long projectId);
}
