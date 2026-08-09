package com.buildflow.reporting.service.impl;

import com.buildflow.reporting.dto.response.WorkforceReportResponse;
import com.buildflow.reporting.entity.WorkforceSummary;
import com.buildflow.reporting.repository.WorkforceSummaryRepository;
import com.buildflow.reporting.service.WorkforceReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkforceReportServiceImpl implements WorkforceReportService {

    private final WorkforceSummaryRepository workforceRepository;

    @Override
    public List<WorkforceReportResponse> getWorkforceSummaries() {
        return workforceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public WorkforceReportResponse getWorkforceSummary(Long projectId) {
        return workforceRepository.findById(projectId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Workforce summary not found"));
    }

    private WorkforceReportResponse mapToResponse(WorkforceSummary entity) {
        double attendancePercent = 0.0;
        if (entity.getTotalWorkersAssigned() != null && entity.getTotalWorkersAssigned() > 0) {
            attendancePercent = (entity.getWorkersPresentToday().doubleValue() / entity.getTotalWorkersAssigned()) * 100;
        }
        
        return WorkforceReportResponse.builder()
                .projectId(entity.getProjectId())
                .totalWorkersAssigned(entity.getTotalWorkersAssigned())
                .workersPresentToday(entity.getWorkersPresentToday())
                .attendancePercentage(attendancePercent)
                .generatedAt(LocalDateTime.now())
                .build();
    }
}
