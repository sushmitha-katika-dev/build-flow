package com.buildflow.reporting.service;

import com.buildflow.reporting.dto.response.ProjectReportResponse;
import java.util.List;

public interface ProjectReportService {
    List<ProjectReportResponse> getAllProjectSummaries();
    ProjectReportResponse getProjectSummary(Long projectId);
}
