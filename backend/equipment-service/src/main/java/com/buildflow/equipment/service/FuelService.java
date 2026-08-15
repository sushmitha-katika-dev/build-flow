package com.buildflow.equipment.service;

import com.buildflow.equipment.dto.request.FuelRecordRequest;
import com.buildflow.equipment.dto.response.FuelRecordResponse;

import java.util.List;

public interface FuelService {
    FuelRecordResponse addFuelRecord(Long equipmentId, FuelRecordRequest request);
    List<FuelRecordResponse> getFuelRecordsByEquipmentId(Long equipmentId);
    List<FuelRecordResponse> getFuelRecordsByProjectId(Long projectId);
}
