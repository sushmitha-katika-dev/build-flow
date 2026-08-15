package com.buildflow.equipment.controller;

import com.buildflow.equipment.dto.request.EquipmentAssignmentRequest;
import com.buildflow.equipment.dto.request.EquipmentCreateRequest;
import com.buildflow.equipment.dto.request.EquipmentUpdateRequest;
import com.buildflow.equipment.dto.response.EquipmentAssignmentResponse;
import com.buildflow.equipment.dto.response.EquipmentResponse;
import com.buildflow.equipment.service.EquipmentAssignmentService;
import com.buildflow.equipment.service.EquipmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/equipment")
@RequiredArgsConstructor
@Tag(name = "Equipment API", description = "API for managing construction equipment and assignments")
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final EquipmentAssignmentService assignmentService;

    @PostMapping
    @Operation(summary = "Create new equipment")
    public ResponseEntity<EquipmentResponse> createEquipment(@Valid @RequestBody EquipmentCreateRequest request) {
        return new ResponseEntity<>(equipmentService.createEquipment(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update equipment details")
    public ResponseEntity<EquipmentResponse> updateEquipment(@PathVariable Long id, @Valid @RequestBody EquipmentUpdateRequest request) {
        return ResponseEntity.ok(equipmentService.updateEquipment(id, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get equipment by ID")
    public ResponseEntity<EquipmentResponse> getEquipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentService.getEquipmentById(id));
    }

    @GetMapping
    @Operation(summary = "Get all equipment")
    public ResponseEntity<List<EquipmentResponse>> getAllEquipment() {
        return ResponseEntity.ok(equipmentService.getAllEquipment());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete equipment")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/assignments")
    @Operation(summary = "Assign equipment to a project")
    public ResponseEntity<EquipmentAssignmentResponse> assignEquipment(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentAssignmentRequest request) {
        return new ResponseEntity<>(assignmentService.assignEquipment(id, request), HttpStatus.CREATED);
    }

    @PutMapping("/assignments/{assignmentId}/return")
    @Operation(summary = "Return assigned equipment")
    public ResponseEntity<EquipmentAssignmentResponse> returnEquipment(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(assignmentService.returnEquipment(assignmentId));
    }

    @GetMapping("/{id}/assignments")
    @Operation(summary = "Get assignment history for equipment")
    public ResponseEntity<List<EquipmentAssignmentResponse>> getAssignmentsByEquipmentId(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByEquipmentId(id));
    }

    @GetMapping("/projects/{projectId}/assignments")
    @Operation(summary = "Get equipment assignments for a project")
    public ResponseEntity<List<EquipmentAssignmentResponse>> getAssignmentsByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByProjectId(projectId));
    }
}
