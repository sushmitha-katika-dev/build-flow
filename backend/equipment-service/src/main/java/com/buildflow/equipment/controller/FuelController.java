package com.buildflow.equipment.controller;

import com.buildflow.equipment.dto.request.FuelRecordRequest;
import com.buildflow.equipment.dto.response.FuelRecordResponse;
import com.buildflow.equipment.service.FuelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fuel")
@RequiredArgsConstructor
@Tag(name = "Fuel API", description = "API for tracking equipment fuel consumption")
public class FuelController {

    private final FuelService fuelService;

    @PostMapping("/equipment/{equipmentId}")
    @Operation(summary = "Add a fuel record for equipment")
    public ResponseEntity<FuelRecordResponse> addFuelRecord(
            @PathVariable Long equipmentId,
            @Valid @RequestBody FuelRecordRequest request) {
        return new ResponseEntity<>(fuelService.addFuelRecord(equipmentId, request), HttpStatus.CREATED);
    }

    @GetMapping("/equipment/{equipmentId}")
    @Operation(summary = "Get fuel records for equipment")
    public ResponseEntity<List<FuelRecordResponse>> getFuelRecordsByEquipmentId(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(fuelService.getFuelRecordsByEquipmentId(equipmentId));
    }

    @GetMapping("/projects/{projectId}")
    @Operation(summary = "Get fuel records for a project")
    public ResponseEntity<List<FuelRecordResponse>> getFuelRecordsByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(fuelService.getFuelRecordsByProjectId(projectId));
    }
}
