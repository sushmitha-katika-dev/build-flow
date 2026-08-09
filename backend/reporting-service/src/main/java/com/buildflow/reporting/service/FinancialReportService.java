package com.buildflow.reporting.service;

import com.buildflow.reporting.dto.response.FinancialReportResponse;
import java.util.List;

public interface FinancialReportService {
    List<FinancialReportResponse> getFinancialSummaries();
    FinancialReportResponse getFinancialSummary(Long projectId);
}
