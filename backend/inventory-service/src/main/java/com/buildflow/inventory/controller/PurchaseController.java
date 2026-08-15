package com.buildflow.inventory.controller;

import com.buildflow.inventory.dto.request.PurchaseCreateRequest;
import com.buildflow.inventory.dto.request.PurchaseUpdateRequest;
import com.buildflow.inventory.dto.response.PurchaseResponse;
import com.buildflow.inventory.enums.PurchaseStatus;
import com.buildflow.inventory.service.PurchaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/purchases")
@RequiredArgsConstructor
@Tag(name = "Purchases", description = "Purchase Order Management API")
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping
    @Operation(summary = "Create a new purchase order")
    public ResponseEntity<PurchaseResponse> createPurchaseOrder(@Valid @RequestBody PurchaseCreateRequest request) {
        return new ResponseEntity<>(purchaseService.createPurchaseOrder(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get purchase order by ID")
    public ResponseEntity<PurchaseResponse> getPurchaseById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.getPurchaseById(id));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get purchase orders by project ID")
    public ResponseEntity<List<PurchaseResponse>> getPurchasesByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(purchaseService.getPurchasesByProject(projectId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update purchase order details")
    public ResponseEntity<PurchaseResponse> updatePurchase(
            @PathVariable Long id, 
            @Valid @RequestBody PurchaseUpdateRequest request) {
        return ResponseEntity.ok(purchaseService.updatePurchase(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update purchase order status")
    public ResponseEntity<PurchaseResponse> updatePurchaseStatus(
            @PathVariable Long id, 
            @RequestParam PurchaseStatus status) {
        return ResponseEntity.ok(purchaseService.updatePurchaseStatus(id, status));
    }
}
