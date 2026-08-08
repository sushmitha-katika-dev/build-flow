package com.buildflow.workforce.controller;

import com.buildflow.workforce.dto.request.LabourCreateRequest;
import com.buildflow.workforce.dto.request.LabourUpdateRequest;
import com.buildflow.workforce.dto.response.LabourResponse;
import com.buildflow.workforce.enums.LabourStatus;
import com.buildflow.workforce.service.LabourService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workforce/labour")
@RequiredArgsConstructor
@Tag(name = "Labour", description = "Labour Management API")
public class LabourController {

    private final LabourService labourService;

    @PostMapping
    @Operation(summary = "Onboard new labour")
    public ResponseEntity<LabourResponse> onboardLabour(@Valid @RequestBody LabourCreateRequest request) {
        return new ResponseEntity<>(labourService.onboardLabour(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get labour by ID")
    public ResponseEntity<LabourResponse> getLabourById(@PathVariable Long id) {
        return ResponseEntity.ok(labourService.getLabourById(id));
    }

    @GetMapping
    @Operation(summary = "Get all labour")
    public ResponseEntity<List<LabourResponse>> getAllLabour() {
        return ResponseEntity.ok(labourService.getAllLabour());
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get labour by project ID")
    public ResponseEntity<List<LabourResponse>> getLabourByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(labourService.getLabourByProject(projectId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update labour details")
    public ResponseEntity<LabourResponse> updateLabour(
            @PathVariable Long id, 
            @Valid @RequestBody LabourUpdateRequest request) {
        return ResponseEntity.ok(labourService.updateLabour(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update labour status")
    public ResponseEntity<LabourResponse> updateLabourStatus(
            @PathVariable Long id, 
            @RequestParam LabourStatus status) {
        return ResponseEntity.ok(labourService.updateLabourStatus(id, status));
    }
}
