package com.buildflow.equipment.service;

import com.buildflow.equipment.dto.request.MaintenanceRequest;
import com.buildflow.equipment.dto.response.MaintenanceResponse;

import java.util.List;

public interface MaintenanceService {
    MaintenanceResponse scheduleMaintenance(Long equipmentId, MaintenanceRequest request);
    MaintenanceResponse updateMaintenanceStatus(Long maintenanceId, String status);
    List<MaintenanceResponse> getMaintenanceByEquipmentId(Long equipmentId);
}
