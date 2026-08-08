package com.buildflow.workforce.controller;

import com.buildflow.workforce.dto.request.LabourRequest;
import com.buildflow.workforce.dto.response.LabourResponse;
import com.buildflow.workforce.service.LabourService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workforce/labour")
@Tag(name = "Labour", description = "Endpoints for managing labour personnel")
public class LabourController {

    private final LabourService labourService;

    public LabourController(LabourService labourService) {
        this.labourService = labourService;
    }

    @PostMapping
    @Operation(summary = "Create a labourer", description = "Adds a new labourer to the workforce")
    public ResponseEntity<LabourResponse> createLabour(@Valid @RequestBody LabourRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(labourService.createLabour(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a labourer", description = "Retrieves a labourer by their ID")
    public ResponseEntity<LabourResponse> getLabourById(@PathVariable Long id) {
        return ResponseEntity.ok(labourService.getLabourById(id));
    }

    @GetMapping
    @Operation(summary = "Get all labourers", description = "Retrieves a list of all labourers")
    public ResponseEntity<List<LabourResponse>> getAllLabours() {
        return ResponseEntity.ok(labourService.getAllLabours());
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get labourers by project", description = "Retrieves a list of all labourers assigned to a specific project")
    public ResponseEntity<List<LabourResponse>> getLaboursByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(labourService.getLaboursByProjectId(projectId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a labourer", description = "Updates an existing labourer by ID")
    public ResponseEntity<LabourResponse> updateLabour(@PathVariable Long id, @Valid @RequestBody LabourRequest request) {
        return ResponseEntity.ok(labourService.updateLabour(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a labourer", description = "Deletes a labourer by ID")
    public ResponseEntity<Void> deleteLabour(@PathVariable Long id) {
        labourService.deleteLabour(id);
        return ResponseEntity.noContent().build();
    }
}
