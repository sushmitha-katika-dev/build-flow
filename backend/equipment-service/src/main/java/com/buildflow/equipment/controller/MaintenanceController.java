package com.buildflow.equipment.controller;

import com.buildflow.equipment.dto.request.MaintenanceRequest;
import com.buildflow.equipment.dto.response.MaintenanceResponse;
import com.buildflow.equipment.service.MaintenanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/maintenance")
@RequiredArgsConstructor
@Tag(name = "Maintenance API", description = "API for tracking equipment maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping("/equipment/{equipmentId}")
    @Operation(summary = "Schedule maintenance for equipment")
    public ResponseEntity<MaintenanceResponse> scheduleMaintenance(
            @PathVariable Long equipmentId,
            @Valid @RequestBody MaintenanceRequest request) {
        return new ResponseEntity<>(maintenanceService.scheduleMaintenance(equipmentId, request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update maintenance status")
    public ResponseEntity<MaintenanceResponse> updateMaintenanceStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(maintenanceService.updateMaintenanceStatus(id, status));
    }

    @GetMapping("/equipment/{equipmentId}")
    @Operation(summary = "Get maintenance history for equipment")
    public ResponseEntity<List<MaintenanceResponse>> getMaintenanceHistory(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceByEquipmentId(equipmentId));
    }
}
