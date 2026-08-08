package com.buildflow.inventory.service;

import com.buildflow.inventory.dto.request.SupplierRequest;
import com.buildflow.inventory.dto.response.SupplierResponse;

import java.util.List;

public interface SupplierService {
    SupplierResponse createSupplier(SupplierRequest request);
    SupplierResponse getSupplierById(Long id);
    List<SupplierResponse> getAllSuppliers();
    SupplierResponse updateSupplier(Long id, SupplierRequest request);
    void deleteSupplier(Long id);
}
