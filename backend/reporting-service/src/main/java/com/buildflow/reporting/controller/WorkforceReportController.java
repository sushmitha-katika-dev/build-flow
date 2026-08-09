package com.buildflow.reporting.controller;

import com.buildflow.reporting.dto.response.WorkforceReportResponse;
import com.buildflow.reporting.service.WorkforceReportService;
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
@RequestMapping("/api/v1/reporting/workforce")
@RequiredArgsConstructor
@Tag(name = "Workforce Report API", description = "Reporting endpoints for workforce analytics")
public class WorkforceReportController {

    private final WorkforceReportService workforceReportService;

    @GetMapping
    @Operation(summary = "Get all workforce summaries")
    public ResponseEntity<List<WorkforceReportResponse>> getAllWorkforceSummaries() {
        return ResponseEntity.ok(workforceReportService.getWorkforceSummaries());
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get workforce summary for a specific project")
    public ResponseEntity<WorkforceReportResponse> getWorkforceSummaryByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(workforceReportService.getWorkforceSummary(projectId));
    }
}
