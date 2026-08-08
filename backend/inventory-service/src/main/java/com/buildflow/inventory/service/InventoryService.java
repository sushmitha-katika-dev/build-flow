package com.buildflow.inventory.service;

import com.buildflow.inventory.dto.request.InventoryTransactionRequest;
import com.buildflow.inventory.dto.response.InventoryTransactionResponse;

import java.util.List;

public interface InventoryService {
    InventoryTransactionResponse recordTransaction(InventoryTransactionRequest request);
    List<InventoryTransactionResponse> getTransactionsByMaterialId(Long materialId);
    List<InventoryTransactionResponse> getTransactionsByProjectId(Long projectId);
}
