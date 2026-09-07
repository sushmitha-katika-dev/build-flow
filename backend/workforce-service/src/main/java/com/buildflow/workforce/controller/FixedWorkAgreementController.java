package com.buildflow.workforce.controller;

import com.buildflow.workforce.dto.request.FixedWorkAgreementCreateRequest;
import com.buildflow.workforce.dto.response.FixedWorkAgreementResponse;
import com.buildflow.workforce.service.FixedWorkAgreementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workforce/agreements")
@RequiredArgsConstructor
@Tag(name = "Fixed Work Agreements", description = "Fixed Work Agreement Management API")
public class FixedWorkAgreementController {

    private final FixedWorkAgreementService agreementService;

    @PostMapping
    @Operation(summary = "Create fixed work agreement")
    public ResponseEntity<FixedWorkAgreementResponse> createAgreement(@Valid @RequestBody FixedWorkAgreementCreateRequest request) {
        return new ResponseEntity<>(agreementService.createAgreement(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get agreement by ID")
    public ResponseEntity<FixedWorkAgreementResponse> getAgreementById(@PathVariable Long id) {
        return ResponseEntity.ok(agreementService.getAgreementById(id));
    }

    @GetMapping("/labour/{labourId}")
    @Operation(summary = "Get agreements by labour ID")
    public ResponseEntity<List<FixedWorkAgreementResponse>> getAgreementsByLabour(@PathVariable Long labourId) {
        return ResponseEntity.ok(agreementService.getAgreementsByLabour(labourId));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get agreements by project ID")
    public ResponseEntity<List<FixedWorkAgreementResponse>> getAgreementsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(agreementService.getAgreementsByProject(projectId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update fixed work agreement")
    public ResponseEntity<FixedWorkAgreementResponse> updateAgreement(
            @PathVariable Long id, 
            @Valid @RequestBody com.buildflow.workforce.dto.request.FixedWorkAgreementUpdateRequest request) {
        return ResponseEntity.ok(agreementService.updateAgreement(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update agreement status")
    public ResponseEntity<FixedWorkAgreementResponse> updateAgreementStatus(
            @PathVariable Long id, 
            @RequestParam com.buildflow.workforce.enums.FixedWorkStatus status) {
        return ResponseEntity.ok(agreementService.updateAgreementStatus(id, status));
    }
}
