package com.buildflow.inventory.controller;

import com.buildflow.inventory.dto.request.InventoryTransactionCreateRequest;
import com.buildflow.inventory.dto.response.InventoryTransactionResponse;
import com.buildflow.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/transactions")
@RequiredArgsConstructor
@Tag(name = "Inventory Transactions", description = "Material Consumption and Stock-in API")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @Operation(summary = "Record a new inventory transaction (Stock-in/Consumption)")
    public ResponseEntity<InventoryTransactionResponse> recordTransaction(
            @Valid @RequestBody InventoryTransactionCreateRequest request) {
        return new ResponseEntity<>(inventoryService.recordTransaction(request), HttpStatus.CREATED);
    }

    @GetMapping("/material/{materialId}")
    @Operation(summary = "Get transactions by material ID")
    public ResponseEntity<List<InventoryTransactionResponse>> getTransactionsByMaterialId(@PathVariable Long materialId) {
        return ResponseEntity.ok(inventoryService.getTransactionsByMaterialId(materialId));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get transactions by project ID")
    public ResponseEntity<List<InventoryTransactionResponse>> getTransactionsByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(inventoryService.getTransactionsByProjectId(projectId));
    }
}
