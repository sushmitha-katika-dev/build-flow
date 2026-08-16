package com.buildflow.inventory.service.impl;

import com.buildflow.inventory.dto.request.InventoryTransactionCreateRequest;
import com.buildflow.inventory.dto.response.InventoryTransactionResponse;
import com.buildflow.inventory.entity.InventoryTransaction;
import com.buildflow.inventory.enums.TransactionType;
import com.buildflow.inventory.exception.ResourceNotFoundException;
import com.buildflow.inventory.mapper.InventoryTransactionMapper;
import com.buildflow.inventory.repository.InventoryTransactionRepository;
import com.buildflow.inventory.repository.MaterialRepository;
import com.buildflow.inventory.service.InventoryService;
import com.buildflow.inventory.service.StockService;
import com.buildflow.inventory.validator.InventoryTransactionValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryServiceImpl implements InventoryService {

    private final InventoryTransactionRepository transactionRepository;
    private final MaterialRepository materialRepository;
    private final StockService stockService;
    private final InventoryTransactionMapper transactionMapper;
    private final InventoryTransactionValidator transactionValidator;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public InventoryTransactionResponse recordTransaction(InventoryTransactionCreateRequest request) {
        log.info("Recording transaction for material ID: {}", request.getMaterialId());

        if (!materialRepository.existsById(request.getMaterialId())) {
            throw new ResourceNotFoundException("Material not found with id: " + request.getMaterialId());
        }

        transactionValidator.validateCreateRequest(request);

        InventoryTransaction transaction = transactionMapper.toEntity(request);
        
        if (request.getTransactionType() == TransactionType.STOCK_IN) {
            if (request.getUnitCost() == null) {
                throw new IllegalArgumentException("Unit cost is required for STOCK_IN transactions");
            }
            transaction.setUnitCost(request.getUnitCost());
            transaction.setTotalCost(request.getQuantity().multiply(request.getUnitCost()));
            
            transaction = transactionRepository.save(transaction);
            stockService.processStockIn(request.getMaterialId(), request.getProjectId(), request.getVariant(), request.getQuantity(), request.getUnitCost());
            
        } else if (request.getTransactionType() == TransactionType.CONSUMPTION) {
            com.buildflow.inventory.entity.Stock stock = stockService.processStockOut(request.getMaterialId(), request.getProjectId(), request.getVariant(), request.getQuantity());
            
            java.math.BigDecimal avgCost = stock.getAverageUnitCost() != null ? stock.getAverageUnitCost() : java.math.BigDecimal.ZERO;
            transaction.setUnitCost(avgCost);
            transaction.setTotalCost(request.getQuantity().multiply(avgCost));
            
            transaction = transactionRepository.save(transaction);
            kafkaTemplate.send("inventory-material-consumed", transaction);
        } else if (request.getTransactionType() == TransactionType.TRANSFER) {
            // Deduct from Company
            com.buildflow.inventory.entity.Stock companyStock = stockService.processStockOut(request.getMaterialId(), 0L, request.getVariant(), request.getQuantity());
            
            java.math.BigDecimal avgCost = companyStock.getAverageUnitCost() != null ? companyStock.getAverageUnitCost() : java.math.BigDecimal.ZERO;
            transaction.setUnitCost(avgCost);
            transaction.setTotalCost(request.getQuantity().multiply(avgCost));
            transaction = transactionRepository.save(transaction);
            
            // Add to Project
            stockService.processStockIn(request.getMaterialId(), request.getProjectId(), request.getVariant(), request.getQuantity(), avgCost);
        } else {
            transaction = transactionRepository.save(transaction);
        }

        return transactionMapper.toResponse(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryTransactionResponse> getTransactionsByMaterialId(Long materialId) {
        return transactionRepository.findByMaterialId(materialId).stream()
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryTransactionResponse> getTransactionsByProjectId(Long projectId) {
        return transactionRepository.findByProjectId(projectId).stream()
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());
    }
}
