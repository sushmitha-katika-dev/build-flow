package com.buildflow.inventory.controller;

import com.buildflow.inventory.dto.request.StockCreateRequest;
import com.buildflow.inventory.dto.request.StockUpdateRequest;
import com.buildflow.inventory.dto.response.StockResponse;
import com.buildflow.inventory.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/stocks")
@RequiredArgsConstructor
@Tag(name = "Stocks", description = "Stock Management API")
public class StockController {

    private final StockService stockService;

    @PostMapping
    @Operation(summary = "Initialize stock for a material")
    public ResponseEntity<StockResponse> initializeStock(@Valid @RequestBody StockCreateRequest request) {
        return new ResponseEntity<>(stockService.initializeStock(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get stock by ID")
    public ResponseEntity<StockResponse> getStockById(@PathVariable Long id) {
        return ResponseEntity.ok(stockService.getStockById(id));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get stock inventory by project ID")
    public ResponseEntity<List<StockResponse>> getStockByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(stockService.getStockByProject(projectId));
    }

    @GetMapping("/material/{materialId}/project/{projectId}")
    @Operation(summary = "Get stock by material ID and project ID")
    public ResponseEntity<StockResponse> getStockByMaterialAndProject(
            @PathVariable Long materialId, 
            @PathVariable Long projectId) {
        return ResponseEntity.ok(stockService.getStockByMaterialAndProject(materialId, projectId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update stock quantity directly")
    public ResponseEntity<StockResponse> updateStock(
            @PathVariable Long id, 
            @Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(stockService.updateStock(id, request));
    }
}
