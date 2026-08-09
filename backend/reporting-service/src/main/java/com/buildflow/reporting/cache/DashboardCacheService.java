package com.buildflow.reporting.cache;

import com.buildflow.reporting.constants.ReportingConstants;
import com.buildflow.reporting.dto.response.DashboardResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardCacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    public void cacheDashboard(DashboardResponse response) {
        log.info("Caching dashboard response");
        redisTemplate.opsForValue().set(ReportingConstants.DASHBOARD_CACHE, response, 10, TimeUnit.MINUTES);
    }

    public DashboardResponse getCachedDashboard() {
        log.info("Fetching dashboard from cache");
        return (DashboardResponse) redisTemplate.opsForValue().get(ReportingConstants.DASHBOARD_CACHE);
    }
    
    public void invalidateDashboardCache() {
        log.info("Invalidating dashboard cache");
        redisTemplate.delete(ReportingConstants.DASHBOARD_CACHE);
    }
}
