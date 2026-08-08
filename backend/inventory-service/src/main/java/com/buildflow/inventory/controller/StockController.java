package com.buildflow.inventory.controller;

import com.buildflow.inventory.dto.request.StockRequest;
import com.buildflow.inventory.dto.response.StockResponse;
import com.buildflow.inventory.service.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @PostMapping
    public ResponseEntity<StockResponse> initializeOrUpdateStock(@Valid @RequestBody StockRequest request) {
        return new ResponseEntity<>(stockService.initializeOrUpdateStock(request), HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<StockResponse> getStockByMaterialAndProject(@RequestParam Long materialId, @RequestParam(required = false) Long projectId) {
        return ResponseEntity.ok(stockService.getStockByMaterialAndProject(materialId, projectId));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<StockResponse>> getStockByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(stockService.getStockByProjectId(projectId));
    }
}
