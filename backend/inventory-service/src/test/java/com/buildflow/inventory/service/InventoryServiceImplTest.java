package com.buildflow.inventory.service;

import com.buildflow.inventory.dto.request.InventoryTransactionRequest;
import com.buildflow.inventory.dto.response.InventoryTransactionResponse;
import com.buildflow.inventory.entity.InventoryTransaction;
import com.buildflow.inventory.enums.TransactionType;
import com.buildflow.inventory.repository.InventoryTransactionRepository;
import com.buildflow.inventory.repository.MaterialRepository;
import com.buildflow.inventory.service.impl.InventoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    private InventoryTransactionRequest transactionRequest;
    private InventoryTransaction transaction;

    @BeforeEach
    void setUp() {
        transactionRequest = new InventoryTransactionRequest();
        transactionRequest.setMaterialId(1L);
        transactionRequest.setProjectId(1L);
        transactionRequest.setTransactionType(TransactionType.CONSUMPTION);
        transactionRequest.setQuantity(BigDecimal.valueOf(10));
        transactionRequest.setTransactionDate(LocalDateTime.now());
        
        transaction = InventoryTransaction.builder()
                .id(1L)
                .materialId(1L)
                .projectId(1L)
                .transactionType(TransactionType.CONSUMPTION)
                .quantity(BigDecimal.valueOf(10))
                .transactionDate(LocalDateTime.now())
                .build();
    }

    @Test
    void recordTransaction_Consumption_Success() {
        when(materialRepository.existsById(1L)).thenReturn(true);
        when(transactionRepository.save(any(InventoryTransaction.class))).thenReturn(transaction);

        InventoryTransactionResponse response = inventoryService.recordTransaction(transactionRequest);

        assertNotNull(response);
        verify(stockService).processStockOut(1L, 1L, BigDecimal.valueOf(10));
        verify(kafkaTemplate).send(eq("inventory-material-consumed"), any(InventoryTransaction.class));
    }
}
