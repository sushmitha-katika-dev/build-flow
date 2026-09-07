package com.buildflow.equipment.service;

import com.buildflow.equipment.dto.request.EquipmentAssignmentRequest;
import com.buildflow.equipment.dto.response.EquipmentAssignmentResponse;

import java.util.List;

public interface EquipmentAssignmentService {
    EquipmentAssignmentResponse assignEquipment(Long equipmentId, EquipmentAssignmentRequest request);
    EquipmentAssignmentResponse returnEquipment(Long assignmentId);
    List<EquipmentAssignmentResponse> getAssignmentsByEquipmentId(Long equipmentId);
    List<EquipmentAssignmentResponse> getAssignmentsByProjectId(Long projectId);
    void closeActiveAssignmentsForProject(Long projectId);
}
