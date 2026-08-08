package com.buildflow.inventory.service;

import com.buildflow.inventory.dto.request.PurchaseRequest;
import com.buildflow.inventory.dto.response.PurchaseResponse;
import com.buildflow.inventory.entity.Purchase;
import com.buildflow.inventory.enums.PurchaseStatus;
import com.buildflow.inventory.repository.MaterialRepository;
import com.buildflow.inventory.repository.PurchaseRepository;
import com.buildflow.inventory.repository.SupplierRepository;
import com.buildflow.inventory.service.impl.PurchaseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseServiceImplTest {

    @Mock
    private PurchaseRepository purchaseRepository;
    @Mock
    private MaterialRepository materialRepository;
    @Mock
    private SupplierRepository supplierRepository;
    @Mock
    private StockService stockService;
    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private PurchaseServiceImpl purchaseService;

    private PurchaseRequest purchaseRequest;
    private Purchase purchase;

    @BeforeEach
    void setUp() {
        purchaseRequest = new PurchaseRequest();
        purchaseRequest.setMaterialId(1L);
        purchaseRequest.setSupplierId(1L);
        purchaseRequest.setQuantity(BigDecimal.valueOf(100));
        purchaseRequest.setUnitPrice(BigDecimal.valueOf(50));
        purchaseRequest.setPurchaseDate(LocalDate.now());
        purchaseRequest.setStatus(PurchaseStatus.PENDING);

        purchase = Purchase.builder()
                .id(1L)
                .materialId(1L)
                .supplierId(1L)
                .quantity(BigDecimal.valueOf(100))
                .unitPrice(BigDecimal.valueOf(50))
                .totalAmount(BigDecimal.valueOf(5000))
                .purchaseDate(LocalDate.now())
                .status(PurchaseStatus.PENDING)
                .build();
    }

    @Test
    void recordPurchase_Success() {
        when(materialRepository.existsById(1L)).thenReturn(true);
        when(supplierRepository.existsById(1L)).thenReturn(true);
        when(purchaseRepository.save(any(Purchase.class))).thenReturn(purchase);

        PurchaseResponse response = purchaseService.recordPurchase(purchaseRequest);

        assertNotNull(response);
        assertEquals(0, BigDecimal.valueOf(5000).compareTo(response.getTotalAmount()));
        verify(kafkaTemplate).send(eq("inventory-purchase-recorded"), any(Purchase.class));
    }
}
