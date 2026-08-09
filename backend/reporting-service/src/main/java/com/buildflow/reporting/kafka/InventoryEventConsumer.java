package com.buildflow.reporting.kafka;

import com.buildflow.reporting.constants.ReportingConstants;
import com.buildflow.reporting.entity.DashboardSnapshot;
import com.buildflow.reporting.entity.InventorySummary;
import com.buildflow.reporting.repository.DashboardSnapshotRepository;
import com.buildflow.reporting.repository.InventorySummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryEventConsumer {

    private final InventorySummaryRepository inventoryRepository;
    private final DashboardSnapshotRepository dashboardRepository;

    @KafkaListener(topics = ReportingConstants.INVENTORY_USED_TOPIC, groupId = "reporting-group")
    public void consumeInventoryUsed(Map<String, Object> event) {
        log.info("Consumed Inventory Used Event: {}", event);
        try {
            Long materialId = Long.valueOf(event.get("material_id").toString());
            Integer remainingQuantity = Integer.valueOf(event.get("remaining_quantity").toString());
            
            InventorySummary summary = inventoryRepository.findById(materialId)
                    .orElse(InventorySummary.builder()
                            .materialId(materialId)
                            .materialName("Material-" + materialId) // Should Ideally come from event
                            .lowStockThreshold(50) // Default
                            .build());
                            
            summary.setTotalQuantityAvailable(remainingQuantity);
            summary.setIsLowStock(remainingQuantity < summary.getLowStockThreshold());
            
            inventoryRepository.save(summary);
            
            updateDashboardSnapshot();
        } catch (Exception e) {
            log.error("Error processing inventory event", e);
        }
    }
    
    private void updateDashboardSnapshot() {
        DashboardSnapshot snapshot = dashboardRepository.findById(1L).orElse(new DashboardSnapshot());
        snapshot.setId(1L);
        long lowStockCount = inventoryRepository.findAll().stream().filter(InventorySummary::getIsLowStock).count();
        snapshot.setLowStockAlertsCount((int) lowStockCount);
        dashboardRepository.save(snapshot);
    }
}
