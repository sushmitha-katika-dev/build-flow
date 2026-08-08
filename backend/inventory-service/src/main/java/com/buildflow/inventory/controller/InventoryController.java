package com.buildflow.inventory.controller;

import com.buildflow.inventory.dto.request.InventoryTransactionRequest;
import com.buildflow.inventory.dto.response.InventoryTransactionResponse;
import com.buildflow.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory-transactions")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    public ResponseEntity<InventoryTransactionResponse> recordTransaction(@Valid @RequestBody InventoryTransactionRequest request) {
        return new ResponseEntity<>(inventoryService.recordTransaction(request), HttpStatus.CREATED);
    }

    @GetMapping("/material/{materialId}")
    public ResponseEntity<List<InventoryTransactionResponse>> getTransactionsByMaterialId(@PathVariable Long materialId) {
        return ResponseEntity.ok(inventoryService.getTransactionsByMaterialId(materialId));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<InventoryTransactionResponse>> getTransactionsByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(inventoryService.getTransactionsByProjectId(projectId));
    }
}
