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
            if (event == null || event.get("id") == null) {
                log.warn("Skipping null project created event");
                return;
            }
            Long projectId = Long.valueOf(event.get("id").toString());
            
            Object nameObj = event.get("projectName") != null ? event.get("projectName") : event.get("name");
            String name = nameObj != null ? nameObj.toString() : "Project #" + projectId;
            
            Object statusObj = event.get("status");
            String status = statusObj != null ? statusObj.toString() : "PLANNED";
            
            Object budgetObj = event.get("estimatedBudget") != null ? event.get("estimatedBudget") : event.get("estimated_budget");
            BigDecimal budget = budgetObj != null ? new BigDecimal(budgetObj.toString()) : BigDecimal.ZERO;
            
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
