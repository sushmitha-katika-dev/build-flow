package com.buildflow.workforce.controller;

import com.buildflow.workforce.dto.request.WageRequest;
import com.buildflow.workforce.dto.response.WageResponse;
import com.buildflow.workforce.service.WageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workforce/wages")
@Tag(name = "Wages", description = "Endpoints for managing labour wages")
public class WageController {

    private final WageService wageService;

    public WageController(WageService wageService) {
        this.wageService = wageService;
    }

    @PostMapping
    @Operation(summary = "Record wage", description = "Records a wage payment for a labourer")
    public ResponseEntity<WageResponse> recordWage(@Valid @RequestBody WageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(wageService.recordWage(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get wage by ID", description = "Retrieves a wage record by its ID")
    public ResponseEntity<WageResponse> getWageById(@PathVariable Long id) {
        return ResponseEntity.ok(wageService.getWageById(id));
    }

    @GetMapping("/labour/{labourId}")
    @Operation(summary = "Get wages by labourer", description = "Retrieves all wage records for a specific labourer")
    public ResponseEntity<List<WageResponse>> getWagesByLabourId(@PathVariable Long labourId) {
        return ResponseEntity.ok(wageService.getWagesByLabourId(labourId));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get wages by project", description = "Retrieves all wage records for a specific project")
    public ResponseEntity<List<WageResponse>> getWagesByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(wageService.getWagesByProjectId(projectId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update wage", description = "Updates an existing wage record by ID")
    public ResponseEntity<WageResponse> updateWage(@PathVariable Long id, @Valid @RequestBody WageRequest request) {
        return ResponseEntity.ok(wageService.updateWage(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete wage", description = "Deletes a wage record by ID")
    public ResponseEntity<Void> deleteWage(@PathVariable Long id) {
        wageService.deleteWage(id);
        return ResponseEntity.noContent().build();
    }
}
