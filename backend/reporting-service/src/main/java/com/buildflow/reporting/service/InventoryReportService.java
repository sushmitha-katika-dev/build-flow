package com.buildflow.reporting.service;

import com.buildflow.reporting.dto.response.InventoryReportResponse;
import java.util.List;

public interface InventoryReportService {
    List<InventoryReportResponse> getInventorySummaries();
    InventoryReportResponse getInventorySummary(Long materialId);
}
