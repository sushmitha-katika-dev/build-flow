package com.buildflow.inventory.service.impl;

import com.buildflow.inventory.dto.request.StockRequest;
import com.buildflow.inventory.dto.response.StockResponse;
import com.buildflow.inventory.entity.Stock;
import com.buildflow.inventory.repository.StockRepository;
import com.buildflow.inventory.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {

    private final StockRepository stockRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public StockResponse initializeOrUpdateStock(StockRequest request) {
        Stock stock = stockRepository.findByMaterialIdAndProjectId(request.getMaterialId(), request.getProjectId())
                .orElse(Stock.builder()
                        .materialId(request.getMaterialId())
                        .projectId(request.getProjectId())
                        .currentStock(BigDecimal.ZERO)
                        .reorderLevel(request.getReorderLevel())
                        .build());

        stock.setCurrentStock(request.getCurrentStock());
        if (request.getReorderLevel() != null) {
            stock.setReorderLevel(request.getReorderLevel());
        }

        Stock savedStock = stockRepository.save(stock);
        checkReorderLevel(savedStock);

        return mapToResponse(savedStock);
    }

    @Override
    public StockResponse getStockByMaterialAndProject(Long materialId, Long projectId) {
        Stock stock = stockRepository.findByMaterialIdAndProjectId(materialId, projectId)
                .orElse(Stock.builder()
                        .materialId(materialId)
                        .projectId(projectId)
                        .currentStock(BigDecimal.ZERO)
                        .reorderLevel(BigDecimal.ZERO)
                        .build()); // Return zero stock if not initialized
        return mapToResponse(stock);
    }

    @Override
    public List<StockResponse> getStockByProjectId(Long projectId) {
        return stockRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void processStockIn(Long materialId, Long projectId, BigDecimal quantity) {
        Stock stock = stockRepository.findByMaterialIdAndProjectId(materialId, projectId)
                .orElse(Stock.builder()
                        .materialId(materialId)
                        .projectId(projectId)
                        .currentStock(BigDecimal.ZERO)
                        .reorderLevel(BigDecimal.ZERO)
                        .build());

        stock.setCurrentStock(stock.getCurrentStock().add(quantity));
        stockRepository.save(stock);
    }

    @Override
    @Transactional
    public void processStockOut(Long materialId, Long projectId, BigDecimal quantity) {
        Stock stock = stockRepository.findByMaterialIdAndProjectId(materialId, projectId)
                .orElseThrow(() -> new IllegalArgumentException("No stock found to consume for material " + materialId));

        if (stock.getCurrentStock().compareTo(quantity) < 0) {
            throw new IllegalArgumentException("Insufficient stock for material " + materialId);
        }

        stock.setCurrentStock(stock.getCurrentStock().subtract(quantity));
        Stock updated = stockRepository.save(stock);
        
        checkReorderLevel(updated);
    }

    private void checkReorderLevel(Stock stock) {
        if (stock.getCurrentStock().compareTo(stock.getReorderLevel()) <= 0) {
            kafkaTemplate.send("inventory-low-stock-alert", stock);
        }
    }

    private StockResponse mapToResponse(Stock stock) {
        return StockResponse.builder()
                .id(stock.getId())
                .materialId(stock.getMaterialId())
                .projectId(stock.getProjectId())
                .currentStock(stock.getCurrentStock())
                .reorderLevel(stock.getReorderLevel())
                .createdAt(stock.getCreatedAt())
                .updatedAt(stock.getUpdatedAt())
                .build();
    }
}
