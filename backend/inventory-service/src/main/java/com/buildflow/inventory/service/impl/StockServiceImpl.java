package com.buildflow.inventory.service.impl;

import com.buildflow.inventory.constants.InventoryConstants;
import com.buildflow.inventory.dto.request.StockCreateRequest;
import com.buildflow.inventory.dto.request.StockUpdateRequest;
import com.buildflow.inventory.dto.response.StockResponse;
import com.buildflow.inventory.entity.Stock;
import com.buildflow.inventory.exception.ResourceNotFoundException;
import com.buildflow.inventory.mapper.StockMapper;
import com.buildflow.inventory.repository.MaterialRepository;
import com.buildflow.inventory.repository.StockRepository;
import com.buildflow.inventory.service.StockService;
import com.buildflow.inventory.validator.StockValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockServiceImpl implements StockService {

    private final StockRepository stockRepository;
    private final MaterialRepository materialRepository;
    private final StockMapper stockMapper;
    private final StockValidator stockValidator;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public StockResponse initializeStock(StockCreateRequest request) {
        log.info("Initializing stock for material ID: {} and project ID: {}", request.getMaterialId(), request.getProjectId());

        if (!materialRepository.existsById(request.getMaterialId())) {
            throw new ResourceNotFoundException("Material not found with id: " + request.getMaterialId());
        }

        stockValidator.validateCreateRequest(request);

        Stock stock = stockMapper.toEntity(request);
        stock.setReorderLevel(BigDecimal.ZERO); // default
        stock.setAverageUnitCost(BigDecimal.ZERO);
        stock = stockRepository.save(stock);

        return stockMapper.toResponse(stock);
    }

    @Override
    @Transactional(readOnly = true)
    public StockResponse getStockById(Long id) {
        Stock stock = stockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found with id: " + id));
        return stockMapper.toResponse(stock);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockResponse> getStockByProject(Long projectId) {
        return stockRepository.findByProjectId(projectId).stream()
                .map(stockMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StockResponse getStockByMaterialAndProjectAndVariant(Long materialId, Long projectId, String variant) {
        String safeVariant = (variant == null || variant.trim().isEmpty()) ? "DEFAULT" : variant.trim();
        Stock stock = stockRepository.findByMaterialIdAndProjectIdAndVariant(materialId, projectId, safeVariant)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found for material ID: " + materialId + ", project ID: " + projectId + ", variant: " + safeVariant));
        return stockMapper.toResponse(stock);
    }

    @Override
    @Transactional
    public StockResponse updateStock(Long id, StockUpdateRequest request) {
        Stock stock = stockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found with id: " + id));

        stockValidator.validateUpdateRequest(request, stock);

        if (request.getQuantity() != null) stock.setCurrentStock(request.getQuantity());

        stock = stockRepository.save(stock);
        return stockMapper.toResponse(stock);
    }

    @Override
    @Transactional
    public Stock processStockIn(Long materialId, Long projectId, String variant, BigDecimal quantity, BigDecimal unitCost) {
        String safeVariant = (variant == null || variant.trim().isEmpty()) ? "DEFAULT" : variant.trim();
        Stock stock = stockRepository.findByMaterialIdAndProjectIdAndVariant(materialId, projectId, safeVariant)
                .orElseGet(() -> {
                    Stock newStock = new Stock();
                    newStock.setMaterialId(materialId);
                    newStock.setProjectId(projectId);
                    newStock.setVariant(safeVariant);
                    newStock.setCurrentStock(BigDecimal.ZERO);
                    newStock.setReorderLevel(BigDecimal.ZERO);
                    newStock.setAverageUnitCost(BigDecimal.ZERO);
                    return newStock;
                });

        BigDecimal currentStock = stock.getCurrentStock() != null ? stock.getCurrentStock() : BigDecimal.ZERO;
        BigDecimal currentAverage = stock.getAverageUnitCost() != null ? stock.getAverageUnitCost() : BigDecimal.ZERO;
        BigDecimal incomingCost = unitCost != null ? unitCost : BigDecimal.ZERO;
        
        BigDecimal totalCurrentValue = currentStock.multiply(currentAverage);
        BigDecimal totalIncomingValue = quantity.multiply(incomingCost);
        
        BigDecimal newTotalStock = currentStock.add(quantity);
        
        if (newTotalStock.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal newAverageCost = totalCurrentValue.add(totalIncomingValue)
                    .divide(newTotalStock, 2, java.math.RoundingMode.HALF_UP);
            stock.setAverageUnitCost(newAverageCost);
        }

        stock.setCurrentStock(newTotalStock);
        stock = stockRepository.save(stock);

        kafkaTemplate.send(InventoryConstants.STOCK_UPDATED_TOPIC, stock);
        return stock;
    }

    @Override
    @Transactional
    public Stock processStockOut(Long materialId, Long projectId, String variant, BigDecimal quantity) {
        String safeVariant = (variant == null || variant.trim().isEmpty()) ? "DEFAULT" : variant.trim();
        Stock stock = stockRepository.findByMaterialIdAndProjectIdAndVariant(materialId, projectId, safeVariant)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found for material ID: " + materialId + " and project ID: " + projectId + " and variant: " + safeVariant));

        if (stock.getCurrentStock().compareTo(quantity) < 0) {
            throw new IllegalArgumentException("Insufficient stock for material ID: " + materialId);
        }

        stock.setCurrentStock(stock.getCurrentStock().subtract(quantity));
        stock = stockRepository.save(stock);

        kafkaTemplate.send(InventoryConstants.STOCK_UPDATED_TOPIC, stock);
        return stock;
    }
}
