package com.buildflow.reporting.service;

import com.buildflow.reporting.dto.response.DashboardResponse;

public interface DashboardService {
    DashboardResponse getDashboardMetrics();
    void forceRefreshDashboard();
}
