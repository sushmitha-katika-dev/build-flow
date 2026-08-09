package com.buildflow.reporting.service;

import com.buildflow.reporting.dto.response.WorkforceReportResponse;
import java.util.List;

public interface WorkforceReportService {
    List<WorkforceReportResponse> getWorkforceSummaries();
    WorkforceReportResponse getWorkforceSummary(Long projectId);
}
