package com.buildflow.workforce.controller;

import com.buildflow.workforce.dto.request.WageCreateRequest;
import com.buildflow.workforce.dto.request.WageUpdateRequest;
import com.buildflow.workforce.dto.response.WageResponse;
import com.buildflow.workforce.service.WageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workforce/wages")
@RequiredArgsConstructor
@Tag(name = "Wages", description = "Wage Management API")
public class WageController {

    private final WageService wageService;

    @PostMapping
    @Operation(summary = "Record wage payment")
    public ResponseEntity<WageResponse> recordWage(@Valid @RequestBody WageCreateRequest request) {
        return new ResponseEntity<>(wageService.recordWage(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get wage record by ID")
    public ResponseEntity<WageResponse> getWageById(@PathVariable Long id) {
        return ResponseEntity.ok(wageService.getWageById(id));
    }

    @GetMapping("/labour/{labourId}")
    @Operation(summary = "Get wage history for a specific labour")
    public ResponseEntity<List<WageResponse>> getWagesByLabourId(@PathVariable Long labourId) {
        return ResponseEntity.ok(wageService.getWagesByLabourId(labourId));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get wages paid for a specific project")
    public ResponseEntity<List<WageResponse>> getWagesByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(wageService.getWagesByProjectId(projectId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update wage record")
    public ResponseEntity<WageResponse> updateWage(
            @PathVariable Long id, 
            @Valid @RequestBody WageUpdateRequest request) {
        return ResponseEntity.ok(wageService.updateWage(id, request));
    }
}
