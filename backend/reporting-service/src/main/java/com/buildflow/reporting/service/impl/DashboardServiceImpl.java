package com.buildflow.reporting.service.impl;

import com.buildflow.reporting.cache.DashboardCacheService;
import com.buildflow.reporting.dto.response.DashboardResponse;
import com.buildflow.reporting.entity.DashboardSnapshot;
import com.buildflow.reporting.repository.DashboardSnapshotRepository;
import com.buildflow.reporting.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final DashboardSnapshotRepository dashboardRepository;
    private final DashboardCacheService cacheService;

    @Override
    public DashboardResponse getDashboardMetrics() {
        DashboardResponse cachedResponse = cacheService.getCachedDashboard();
        if (cachedResponse != null) {
            log.info("Returning dashboard metrics from cache");
            return cachedResponse;
        }

        log.info("Cache miss. Building dashboard metrics from database");
        DashboardSnapshot snapshot = dashboardRepository.findById(1L).orElse(new DashboardSnapshot());
        
        BigDecimal revenue = snapshot.getTotalCompanyRevenue() != null ? snapshot.getTotalCompanyRevenue() : BigDecimal.ZERO;
        BigDecimal expenses = snapshot.getTotalCompanyExpenses() != null ? snapshot.getTotalCompanyExpenses() : BigDecimal.ZERO;
        
        DashboardResponse response = DashboardResponse.builder()
                .activeProjectsCount(snapshot.getActiveProjectsCount() != null ? snapshot.getActiveProjectsCount() : 0)
                .lowStockAlertsCount(snapshot.getLowStockAlertsCount() != null ? snapshot.getLowStockAlertsCount() : 0)
                .totalCompanyRevenue(revenue)
                .totalCompanyExpenses(expenses)
                .netProfitOrLoss(revenue.subtract(expenses))
                .generatedAt(LocalDateTime.now())
                .build();
                
        cacheService.cacheDashboard(response);
        return response;
    }

    @Override
    public void forceRefreshDashboard() {
        log.info("Forcing dashboard cache refresh");
        cacheService.invalidateDashboardCache();
        getDashboardMetrics(); // rebuild and cache
    }
}
