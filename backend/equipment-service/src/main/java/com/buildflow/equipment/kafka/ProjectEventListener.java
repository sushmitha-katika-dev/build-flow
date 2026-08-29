package com.buildflow.equipment.kafka;

import com.buildflow.equipment.service.EquipmentAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectEventListener {

    private final EquipmentAssignmentService assignmentService;

    @KafkaListener(topics = "project-updated", groupId = "equipment-service-group")
    public void consumeProjectUpdated(Map<String, Object> event) {
        log.info("Consumed project-updated event in equipment-service: {}", event);
        try {
            if (event == null || event.get("id") == null || event.get("status") == null) {
                return;
            }
            Long projectId = Long.valueOf(event.get("id").toString());
            String status = String.valueOf(event.get("status"));

            if ("COMPLETED".equalsIgnoreCase(status) || "CANCELLED".equalsIgnoreCase(status)) {
                log.info("Project #{} marked as {}. Releasing active equipment assignments.", projectId, status);
                assignmentService.closeActiveAssignmentsForProject(projectId);
            }
        } catch (Exception e) {
            log.error("Error processing project-updated event in equipment-service", e);
        }
    }
}
