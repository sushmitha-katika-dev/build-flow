package com.buildflow.inventory.service;

import com.buildflow.inventory.dto.request.MaterialCreateRequest;
import com.buildflow.inventory.dto.request.MaterialUpdateRequest;
import com.buildflow.inventory.dto.response.MaterialResponse;

import java.util.List;

public interface MaterialService {
    MaterialResponse createMaterial(MaterialCreateRequest request);
    MaterialResponse getMaterialById(Long id);
    List<MaterialResponse> getAllMaterials();
    MaterialResponse updateMaterial(Long id, MaterialUpdateRequest request);
}
