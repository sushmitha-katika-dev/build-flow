package com.buildflow.finance.messaging;

import com.buildflow.finance.dto.request.BudgetRequest;
import com.buildflow.finance.event.ProjectEvent;
import com.buildflow.finance.service.BudgetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProjectKafkaConsumer {

    private final BudgetService budgetService;

    @KafkaListener(topics = "project-created", groupId = "finance-service-group")
    public void consumeProjectCreated(ProjectEvent event) {
        log.info("Received project-created event for project id: {}", event.getId());
        if (event.getId() == null) return;
        
        BigDecimal estBudget = event.getEstimatedBudget() != null ? event.getEstimatedBudget() : BigDecimal.ZERO;
        
        try {
            BudgetRequest req = new BudgetRequest();
            req.setProjectId(event.getId());
            req.setEstimatedBudget(estBudget);
            budgetService.initializeBudget(req);
        } catch (Exception e) {
            log.warn("Failed to initialize budget (might already exist): {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "project-updated", groupId = "finance-service-group")
    public void consumeProjectUpdated(ProjectEvent event) {
        log.info("Received project-updated event for project id: {}", event.getId());
        if (event.getId() == null) return;
        
        BigDecimal estBudget = event.getEstimatedBudget() != null ? event.getEstimatedBudget() : BigDecimal.ZERO;
        
        try {
            BudgetRequest req = new BudgetRequest();
            req.setProjectId(event.getId());
            req.setEstimatedBudget(estBudget);
            budgetService.updateBudget(event.getId(), req);
        } catch (Exception e) {
            log.warn("Failed to update budget (might not exist): {}", e.getMessage());
            // If it doesn't exist, we can create it
            try {
                BudgetRequest req = new BudgetRequest();
                req.setProjectId(event.getId());
                req.setEstimatedBudget(estBudget);
                budgetService.initializeBudget(req);
            } catch (Exception ex) {
                log.error("Failed to initialize budget on fallback", ex);
            }
        }
    }
}
