package com.buildflow.reporting.kafka;

import com.buildflow.reporting.constants.ReportingConstants;
import com.buildflow.reporting.entity.WorkforceSummary;
import com.buildflow.reporting.repository.WorkforceSummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkforceEventConsumer {

    private final WorkforceSummaryRepository workforceRepository;

    @KafkaListener(topics = ReportingConstants.WORKFORCE_ATTENDANCE_TOPIC, groupId = "reporting-group")
    public void consumeAttendanceLogged(Map<String, Object> event) {
        log.info("Consumed Workforce Attendance Event: {}", event);
        try {
            Long projectId = Long.valueOf(event.get("project_id").toString());
            
            WorkforceSummary summary = workforceRepository.findById(projectId)
                    .orElse(WorkforceSummary.builder()
                            .projectId(projectId)
                            .totalWorkersAssigned(0)
                            .workersPresentToday(0)
                            .build());
                            
            // Simplistic logic: increment present count for today
            // In a real scenario, we'd need to clear this daily or track by date
            summary.setWorkersPresentToday(summary.getWorkersPresentToday() + 1);
            if (summary.getTotalWorkersAssigned() < summary.getWorkersPresentToday()) {
                summary.setTotalWorkersAssigned(summary.getWorkersPresentToday());
            }
            
            workforceRepository.save(summary);
        } catch (Exception e) {
            log.error("Error processing workforce event", e);
        }
    }
}
