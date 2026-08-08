package com.buildflow.inventory.service;

import com.buildflow.inventory.dto.request.PurchaseCreateRequest;
import com.buildflow.inventory.dto.request.PurchaseUpdateRequest;
import com.buildflow.inventory.dto.response.PurchaseResponse;
import com.buildflow.inventory.enums.PurchaseStatus;

import java.util.List;

public interface PurchaseService {
    PurchaseResponse createPurchaseOrder(PurchaseCreateRequest request);
    PurchaseResponse getPurchaseById(Long id);
    List<PurchaseResponse> getPurchasesByProject(Long projectId);
    PurchaseResponse updatePurchase(Long id, PurchaseUpdateRequest request);
    PurchaseResponse updatePurchaseStatus(Long id, PurchaseStatus status);
}
