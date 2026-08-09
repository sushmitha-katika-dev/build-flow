package com.buildflow.reporting.controller;

import com.buildflow.reporting.dto.response.ProjectReportResponse;
import com.buildflow.reporting.service.ProjectReportService;
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
@RequestMapping("/api/v1/reporting/projects")
@RequiredArgsConstructor
@Tag(name = "Project Report API", description = "Reporting endpoints for projects")
public class ProjectReportController {

    private final ProjectReportService projectReportService;

    @GetMapping
    @Operation(summary = "Get all project summaries")
    public ResponseEntity<List<ProjectReportResponse>> getAllProjects() {
        return ResponseEntity.ok(projectReportService.getAllProjectSummaries());
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get project summary by ID")
    public ResponseEntity<ProjectReportResponse> getProjectById(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectReportService.getProjectSummary(projectId));
    }
}
