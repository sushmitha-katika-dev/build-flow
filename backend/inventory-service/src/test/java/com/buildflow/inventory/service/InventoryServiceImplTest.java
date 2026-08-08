package com.buildflow.inventory.service;

import com.buildflow.inventory.dto.request.InventoryTransactionCreateRequest;
import com.buildflow.inventory.dto.response.InventoryTransactionResponse;
import com.buildflow.inventory.entity.InventoryTransaction;
import com.buildflow.inventory.enums.TransactionType;
import com.buildflow.inventory.mapper.InventoryTransactionMapper;
import com.buildflow.inventory.repository.InventoryTransactionRepository;
import com.buildflow.inventory.repository.MaterialRepository;
import com.buildflow.inventory.service.impl.InventoryServiceImpl;
import com.buildflow.inventory.validator.InventoryTransactionValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceImplTest {

    @Mock
    private InventoryTransactionRepository transactionRepository;

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private StockService stockService;

    @Mock
    private InventoryTransactionMapper transactionMapper;

    @Mock
    private InventoryTransactionValidator transactionValidator;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    private InventoryTransactionCreateRequest request;
    private InventoryTransaction transaction;
    private InventoryTransactionResponse response;

    @BeforeEach
    void setUp() {
        request = new InventoryTransactionCreateRequest();
        request.setMaterialId(1L);
        request.setProjectId(100L);
        request.setTransactionType(TransactionType.STOCK_IN);
        request.setQuantity(BigDecimal.valueOf(100));

        transaction = new InventoryTransaction();
        transaction.setId(1L);
        transaction.setMaterialId(1L);
        transaction.setTransactionType(TransactionType.STOCK_IN);
        transaction.setQuantity(BigDecimal.valueOf(100));

        response = new InventoryTransactionResponse();
        response.setId(1L);
        response.setTransactionType(TransactionType.STOCK_IN);
        response.setQuantity(BigDecimal.valueOf(100));
    }

    @Test
    void recordTransaction_StockIn_Success() {
        when(materialRepository.existsById(1L)).thenReturn(true);
        doNothing().when(transactionValidator).validateCreateRequest(any());
        when(transactionMapper.toEntity(any())).thenReturn(transaction);
        when(transactionRepository.save(any(InventoryTransaction.class))).thenReturn(transaction);
        doNothing().when(stockService).processStockIn(1L, 100L, BigDecimal.valueOf(100));
        when(transactionMapper.toResponse(any(InventoryTransaction.class))).thenReturn(response);

        InventoryTransactionResponse result = inventoryService.recordTransaction(request);

        assertNotNull(result);
        assertEquals(TransactionType.STOCK_IN, result.getTransactionType());
        verify(stockService, times(1)).processStockIn(1L, 100L, BigDecimal.valueOf(100));
        verify(kafkaTemplate, never()).send(anyString(), any());
    }
}
