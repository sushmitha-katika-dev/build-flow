package com.buildflow.reporting.service;

import com.buildflow.reporting.cache.DashboardCacheService;
import com.buildflow.reporting.dto.response.DashboardResponse;
import com.buildflow.reporting.entity.DashboardSnapshot;
import com.buildflow.reporting.repository.DashboardSnapshotRepository;
import com.buildflow.reporting.service.impl.DashboardServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {

    @Mock
    private DashboardSnapshotRepository dashboardRepository;
    
    @Mock
    private DashboardCacheService cacheService;
    
    @InjectMocks
    private DashboardServiceImpl dashboardService;

    private DashboardSnapshot snapshot;

    @BeforeEach
    void setUp() {
        snapshot = new DashboardSnapshot();
        snapshot.setId(1L);
        snapshot.setActiveProjectsCount(5);
        snapshot.setLowStockAlertsCount(2);
        snapshot.setTotalCompanyRevenue(new BigDecimal("100000.00"));
        snapshot.setTotalCompanyExpenses(new BigDecimal("60000.00"));
    }

    @Test
    void getDashboardMetrics_ShouldReturnCachedData_IfAvailable() {
        DashboardResponse cachedResponse = new DashboardResponse();
        cachedResponse.setActiveProjectsCount(10);
        
        when(cacheService.getCachedDashboard()).thenReturn(cachedResponse);
        
        DashboardResponse result = dashboardService.getDashboardMetrics();
        
        assertNotNull(result);
        assertEquals(10, result.getActiveProjectsCount());
        verify(dashboardRepository, never()).findById(anyLong());
    }

    @Test
    void getDashboardMetrics_ShouldFetchFromDb_IfCacheMiss() {
        when(cacheService.getCachedDashboard()).thenReturn(null);
        when(dashboardRepository.findById(1L)).thenReturn(Optional.of(snapshot));
        
        DashboardResponse result = dashboardService.getDashboardMetrics();
        
        assertNotNull(result);
        assertEquals(5, result.getActiveProjectsCount());
        assertEquals(2, result.getLowStockAlertsCount());
        assertEquals(new BigDecimal("100000.00"), result.getTotalCompanyRevenue());
        assertEquals(new BigDecimal("60000.00"), result.getTotalCompanyExpenses());
        assertEquals(new BigDecimal("40000.00"), result.getNetProfitOrLoss());
        
        verify(cacheService).cacheDashboard(any(DashboardResponse.class));
    }
}
