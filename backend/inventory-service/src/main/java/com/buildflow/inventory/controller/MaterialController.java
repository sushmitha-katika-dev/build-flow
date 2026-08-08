package com.buildflow.inventory.controller;

import com.buildflow.inventory.dto.request.MaterialCreateRequest;
import com.buildflow.inventory.dto.request.MaterialUpdateRequest;
import com.buildflow.inventory.dto.response.MaterialResponse;
import com.buildflow.inventory.service.MaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/materials")
@RequiredArgsConstructor
@Tag(name = "Materials", description = "Material Management API")
public class MaterialController {

    private final MaterialService materialService;

    @PostMapping
    @Operation(summary = "Create a new material")
    public ResponseEntity<MaterialResponse> createMaterial(@Valid @RequestBody MaterialCreateRequest request) {
        return new ResponseEntity<>(materialService.createMaterial(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get material by ID")
    public ResponseEntity<MaterialResponse> getMaterialById(@PathVariable Long id) {
        return ResponseEntity.ok(materialService.getMaterialById(id));
    }

    @GetMapping
    @Operation(summary = "Get all materials")
    public ResponseEntity<List<MaterialResponse>> getAllMaterials() {
        return ResponseEntity.ok(materialService.getAllMaterials());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update material details")
    public ResponseEntity<MaterialResponse> updateMaterial(
            @PathVariable Long id, 
            @Valid @RequestBody MaterialUpdateRequest request) {
        return ResponseEntity.ok(materialService.updateMaterial(id, request));
    }
}
