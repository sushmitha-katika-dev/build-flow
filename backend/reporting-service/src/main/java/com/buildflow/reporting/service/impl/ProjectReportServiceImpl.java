package com.buildflow.reporting.service.impl;

import com.buildflow.reporting.dto.response.ProjectReportResponse;
import com.buildflow.reporting.entity.ProjectSummary;
import com.buildflow.reporting.repository.ProjectSummaryRepository;
import com.buildflow.reporting.service.ProjectReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectReportServiceImpl implements ProjectReportService {

    private final ProjectSummaryRepository projectRepository;

    @Override
    public List<ProjectReportResponse> getAllProjectSummaries() {
        return projectRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectReportResponse getProjectSummary(Long projectId) {
        return projectRepository.findById(projectId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Project summary not found"));
    }

    private ProjectReportResponse mapToResponse(ProjectSummary entity) {
        return ProjectReportResponse.builder()
                .projectId(entity.getProjectId())
                .projectName(entity.getProjectName())
                .status(entity.getStatus())
                .estimatedBudget(entity.getEstimatedBudget())
                .generatedAt(LocalDateTime.now())
                .build();
    }
}
