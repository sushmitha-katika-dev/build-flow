package com.buildflow.inventory.service;

import com.buildflow.inventory.dto.request.PurchaseRequest;
import com.buildflow.inventory.dto.response.PurchaseResponse;
import com.buildflow.inventory.enums.PurchaseStatus;

import java.util.List;

public interface PurchaseService {
    PurchaseResponse recordPurchase(PurchaseRequest request);
    PurchaseResponse getPurchaseById(Long id);
    List<PurchaseResponse> getPurchasesBySupplierId(Long supplierId);
    PurchaseResponse updatePurchaseStatus(Long id, PurchaseStatus status);
}
