package com.buildflow.inventory.service.impl;

import com.buildflow.inventory.dto.request.InventoryTransactionRequest;
import com.buildflow.inventory.dto.response.InventoryTransactionResponse;
import com.buildflow.inventory.entity.InventoryTransaction;
import com.buildflow.inventory.enums.TransactionType;
import com.buildflow.inventory.exception.ResourceNotFoundException;
import com.buildflow.inventory.repository.InventoryTransactionRepository;
import com.buildflow.inventory.repository.MaterialRepository;
import com.buildflow.inventory.service.InventoryService;
import com.buildflow.inventory.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryTransactionRepository transactionRepository;
    private final MaterialRepository materialRepository;
    private final StockService stockService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public InventoryTransactionResponse recordTransaction(InventoryTransactionRequest request) {
        if (!materialRepository.existsById(request.getMaterialId())) {
            throw new ResourceNotFoundException("Material not found with id: " + request.getMaterialId());
        }

        InventoryTransaction transaction = InventoryTransaction.builder()
                .materialId(request.getMaterialId())
                .projectId(request.getProjectId())
                .transactionType(request.getTransactionType())
                .quantity(request.getQuantity())
                .transactionDate(request.getTransactionDate())
                .notes(request.getNotes())
                .build();

        InventoryTransaction savedTransaction = transactionRepository.save(transaction);

        if (request.getTransactionType() == TransactionType.STOCK_IN) {
            stockService.processStockIn(request.getMaterialId(), request.getProjectId(), request.getQuantity());
        } else if (request.getTransactionType() == TransactionType.CONSUMPTION) {
            stockService.processStockOut(request.getMaterialId(), request.getProjectId(), request.getQuantity());
            kafkaTemplate.send("inventory-material-consumed", savedTransaction);
        }

        return mapToResponse(savedTransaction);
    }

    @Override
    public List<InventoryTransactionResponse> getTransactionsByMaterialId(Long materialId) {
        return transactionRepository.findByMaterialId(materialId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InventoryTransactionResponse> getTransactionsByProjectId(Long projectId) {
        return transactionRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private InventoryTransactionResponse mapToResponse(InventoryTransaction transaction) {
        return InventoryTransactionResponse.builder()
                .id(transaction.getId())
                .materialId(transaction.getMaterialId())
                .projectId(transaction.getProjectId())
                .transactionType(transaction.getTransactionType())
                .quantity(transaction.getQuantity())
                .transactionDate(transaction.getTransactionDate())
                .notes(transaction.getNotes())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }
}
