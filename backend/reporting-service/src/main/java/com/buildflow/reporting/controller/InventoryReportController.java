package com.buildflow.reporting.controller;

import com.buildflow.reporting.dto.response.InventoryReportResponse;
import com.buildflow.reporting.service.InventoryReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reporting/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory Report API", description = "Reporting endpoints for inventory stock levels")
public class InventoryReportController {

    private final InventoryReportService inventoryReportService;

    @GetMapping
    @Operation(summary = "Get all inventory summaries")
    public ResponseEntity<List<InventoryReportResponse>> getAllInventorySummaries() {
        return ResponseEntity.ok(inventoryReportService.getInventorySummaries());
    }

    @GetMapping("/material/{materialId}")
    @Operation(summary = "Get inventory summary for a specific material")
    public ResponseEntity<InventoryReportResponse> getInventorySummaryByMaterial(@PathVariable Long materialId) {
        return ResponseEntity.ok(inventoryReportService.getInventorySummary(materialId));
    }
}
