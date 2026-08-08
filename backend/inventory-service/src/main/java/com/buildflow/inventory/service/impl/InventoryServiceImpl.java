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
        transaction = transactionRepository.save(transaction);

        if (request.getTransactionType() == TransactionType.STOCK_IN) {
            stockService.processStockIn(request.getMaterialId(), request.getProjectId(), request.getQuantity());
        } else if (request.getTransactionType() == TransactionType.CONSUMPTION) {
            stockService.processStockOut(request.getMaterialId(), request.getProjectId(), request.getQuantity());
            kafkaTemplate.send("inventory-material-consumed", transaction);
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
