package com.buildflow.equipment.controller;

import com.buildflow.equipment.dto.request.EquipmentUsageCreateRequest;
import com.buildflow.equipment.dto.response.EquipmentUsageResponse;
import com.buildflow.equipment.service.EquipmentUsageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/equipment/usage")
@RequiredArgsConstructor
@Tag(name = "Equipment Usage API", description = "API for recording equipment usage and costs")
public class EquipmentUsageController {

    private final EquipmentUsageService usageService;

    @PostMapping
    @Operation(summary = "Record equipment usage")
    public ResponseEntity<EquipmentUsageResponse> recordUsage(
            @Valid @RequestBody EquipmentUsageCreateRequest request) {
        return new ResponseEntity<>(usageService.recordUsage(request), HttpStatus.CREATED);
    }

    @GetMapping("/equipment/{equipmentId}")
    @Operation(summary = "Get usage history for equipment")
    public ResponseEntity<List<EquipmentUsageResponse>> getUsageByEquipmentId(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(usageService.getUsageByEquipmentId(equipmentId));
    }

    @GetMapping("/projects/{projectId}")
    @Operation(summary = "Get equipment usage for a project")
    public ResponseEntity<List<EquipmentUsageResponse>> getUsageByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(usageService.getUsageByProjectId(projectId));
    }
}
