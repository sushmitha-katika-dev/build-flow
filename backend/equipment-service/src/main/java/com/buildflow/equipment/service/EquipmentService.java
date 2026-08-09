package com.buildflow.equipment.service;

import com.buildflow.equipment.dto.request.EquipmentCreateRequest;
import com.buildflow.equipment.dto.request.EquipmentUpdateRequest;
import com.buildflow.equipment.dto.response.EquipmentResponse;

import java.util.List;

public interface EquipmentService {
    EquipmentResponse createEquipment(EquipmentCreateRequest request);
    EquipmentResponse updateEquipment(Long id, EquipmentUpdateRequest request);
    EquipmentResponse getEquipmentById(Long id);
    List<EquipmentResponse> getAllEquipment();
    void deleteEquipment(Long id);
}
