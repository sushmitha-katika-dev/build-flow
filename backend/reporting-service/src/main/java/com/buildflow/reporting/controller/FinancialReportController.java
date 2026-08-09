package com.buildflow.reporting.controller;

import com.buildflow.reporting.dto.response.FinancialReportResponse;
import com.buildflow.reporting.service.FinancialReportService;
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
@RequestMapping("/api/v1/reporting/finance")
@RequiredArgsConstructor
@Tag(name = "Financial Report API", description = "Reporting endpoints for financial health")
public class FinancialReportController {

    private final FinancialReportService financialReportService;

    @GetMapping
    @Operation(summary = "Get all financial summaries")
    public ResponseEntity<List<FinancialReportResponse>> getAllFinancialSummaries() {
        return ResponseEntity.ok(financialReportService.getFinancialSummaries());
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get financial summary for a specific project")
    public ResponseEntity<FinancialReportResponse> getFinancialSummaryByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(financialReportService.getFinancialSummary(projectId));
    }
}
