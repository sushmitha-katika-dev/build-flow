package com.buildflow.reporting.service.impl;

import com.buildflow.reporting.dto.response.InventoryReportResponse;
import com.buildflow.reporting.entity.InventorySummary;
import com.buildflow.reporting.repository.InventorySummaryRepository;
import com.buildflow.reporting.service.InventoryReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryReportServiceImpl implements InventoryReportService {

    private final InventorySummaryRepository inventoryRepository;

    @Override
    public List<InventoryReportResponse> getInventorySummaries() {
        return inventoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public InventoryReportResponse getInventorySummary(Long materialId) {
        return inventoryRepository.findById(materialId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Inventory summary not found"));
    }

    private InventoryReportResponse mapToResponse(InventorySummary entity) {
        return InventoryReportResponse.builder()
                .materialId(entity.getMaterialId())
                .materialName(entity.getMaterialName())
                .totalQuantityAvailable(entity.getTotalQuantityAvailable())
                .isLowStock(entity.getIsLowStock())
                .generatedAt(LocalDateTime.now())
                .build();
    }
}
