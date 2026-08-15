package com.buildflow.equipment.service;

import com.buildflow.equipment.dto.request.EquipmentUsageCreateRequest;
import com.buildflow.equipment.dto.response.EquipmentUsageResponse;

import java.util.List;

public interface EquipmentUsageService {
    EquipmentUsageResponse recordUsage(EquipmentUsageCreateRequest request);
    List<EquipmentUsageResponse> getUsageByEquipmentId(Long equipmentId);
    List<EquipmentUsageResponse> getUsageByProjectId(Long projectId);
}
