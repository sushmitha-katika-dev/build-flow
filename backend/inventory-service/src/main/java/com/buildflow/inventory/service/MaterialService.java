package com.buildflow.inventory.service;

import com.buildflow.inventory.dto.request.MaterialRequest;
import com.buildflow.inventory.dto.response.MaterialResponse;

import java.util.List;

public interface MaterialService {
    MaterialResponse createMaterial(MaterialRequest request);
    MaterialResponse getMaterialById(Long id);
    List<MaterialResponse> getAllMaterials();
    MaterialResponse updateMaterial(Long id, MaterialRequest request);
    void deleteMaterial(Long id);
}
