package com.buildflow.reporting.kafka;

import com.buildflow.reporting.constants.ReportingConstants;
import com.buildflow.reporting.entity.DashboardSnapshot;
import com.buildflow.reporting.entity.ProjectSummary;
import com.buildflow.reporting.repository.DashboardSnapshotRepository;
import com.buildflow.reporting.repository.ProjectSummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectEventConsumer {

    private final ProjectSummaryRepository projectRepository;
    private final DashboardSnapshotRepository dashboardRepository;

    @KafkaListener(topics = ReportingConstants.PROJECT_CREATED_TOPIC, groupId = "reporting-group")
    public void consumeProjectCreated(Map<String, Object> event) {
        log.info("Consumed Project Created Event: {}", event);
        try {
            Long projectId = Long.valueOf(event.get("id").toString());
            String name = (String) event.get("name");
            String status = (String) event.get("status");
            BigDecimal budget = new BigDecimal(event.get("estimated_budget").toString());
            
            ProjectSummary summary = ProjectSummary.builder()
                    .projectId(projectId)
                    .projectName(name)
                    .status(status)
                    .estimatedBudget(budget)
                    .build();
            projectRepository.save(summary);
            
            updateDashboardSnapshot();
        } catch (Exception e) {
            log.error("Error processing project created event", e);
        }
    }
    
    private void updateDashboardSnapshot() {
        DashboardSnapshot snapshot = dashboardRepository.findById(1L).orElse(new DashboardSnapshot());
        snapshot.setId(1L);
        snapshot.setActiveProjectsCount((int) projectRepository.count());
        dashboardRepository.save(snapshot);
    }
}
