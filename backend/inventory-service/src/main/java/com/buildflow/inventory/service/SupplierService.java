package com.buildflow.inventory.service;

import com.buildflow.inventory.dto.request.SupplierCreateRequest;
import com.buildflow.inventory.dto.request.SupplierUpdateRequest;
import com.buildflow.inventory.dto.response.SupplierResponse;

import java.util.List;

public interface SupplierService {
    SupplierResponse addSupplier(SupplierCreateRequest request);
    SupplierResponse getSupplierById(Long id);
    List<SupplierResponse> getAllSuppliers();
    SupplierResponse updateSupplier(Long id, SupplierUpdateRequest request);
}
