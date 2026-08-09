package com.buildflow.reporting.controller;

import com.buildflow.reporting.dto.response.DashboardResponse;
import com.buildflow.reporting.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reporting/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard API", description = "High-level analytics and metrics")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Get main dashboard metrics", description = "Returns cached metrics spanning across all services")
    public ResponseEntity<DashboardResponse> getDashboardMetrics() {
        return ResponseEntity.ok(dashboardService.getDashboardMetrics());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Force refresh dashboard cache")
    public ResponseEntity<Void> refreshDashboardCache() {
        dashboardService.forceRefreshDashboard();
        return ResponseEntity.ok().build();
    }
}
