package com.buildflow.inventory.controller;

import com.buildflow.inventory.dto.request.SupplierCreateRequest;
import com.buildflow.inventory.dto.request.SupplierUpdateRequest;
import com.buildflow.inventory.dto.response.SupplierResponse;
import com.buildflow.inventory.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/suppliers")
@RequiredArgsConstructor
@Tag(name = "Suppliers", description = "Supplier Management API")
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    @Operation(summary = "Add a new supplier")
    public ResponseEntity<SupplierResponse> addSupplier(@Valid @RequestBody SupplierCreateRequest request) {
        return new ResponseEntity<>(supplierService.addSupplier(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get supplier by ID")
    public ResponseEntity<SupplierResponse> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }

    @GetMapping
    @Operation(summary = "Get all suppliers")
    public ResponseEntity<List<SupplierResponse>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update supplier details")
    public ResponseEntity<SupplierResponse> updateSupplier(
            @PathVariable Long id, 
            @Valid @RequestBody SupplierUpdateRequest request) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, request));
    }
}
