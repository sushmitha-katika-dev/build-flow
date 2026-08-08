package com.buildflow.inventory.service;

import com.buildflow.inventory.constants.InventoryConstants;
import com.buildflow.inventory.dto.request.PurchaseCreateRequest;
import com.buildflow.inventory.dto.response.PurchaseResponse;
import com.buildflow.inventory.entity.Purchase;
import com.buildflow.inventory.mapper.PurchaseMapper;
import com.buildflow.inventory.repository.MaterialRepository;
import com.buildflow.inventory.repository.PurchaseRepository;
import com.buildflow.inventory.repository.SupplierRepository;
import com.buildflow.inventory.service.impl.PurchaseServiceImpl;
import com.buildflow.inventory.validator.PurchaseValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
    private PurchaseMapper purchaseMapper;

    @Mock
    private PurchaseValidator purchaseValidator;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private PurchaseServiceImpl purchaseService;

    private PurchaseCreateRequest request;
    private Purchase purchase;
    private PurchaseResponse response;

    @BeforeEach
    void setUp() {
        request = new PurchaseCreateRequest();
        request.setMaterialId(1L);
        request.setSupplierId(1L);
        request.setProjectId(100L);
        request.setQuantity(BigDecimal.valueOf(100));
        request.setUnitPrice(BigDecimal.valueOf(50));
        request.setTotalCost(BigDecimal.valueOf(5000));

        purchase = new Purchase();
        purchase.setId(1L);
        purchase.setMaterialId(1L);
        purchase.setSupplierId(1L);
        purchase.setTotalAmount(BigDecimal.valueOf(5000));

        response = new PurchaseResponse();
        response.setId(1L);
        response.setTotalAmount(BigDecimal.valueOf(5000));
    }

    @Test
    void createPurchaseOrder_Success() {
        when(materialRepository.existsById(1L)).thenReturn(true);
        when(supplierRepository.existsById(1L)).thenReturn(true);
        doNothing().when(purchaseValidator).validateCreateRequest(any());
        when(purchaseMapper.toEntity(any())).thenReturn(purchase);
        when(purchaseRepository.save(any(Purchase.class))).thenReturn(purchase);
        when(purchaseMapper.toResponse(any(Purchase.class))).thenReturn(response);

        PurchaseResponse result = purchaseService.createPurchaseOrder(request);

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(5000), result.getTotalAmount());
        verify(kafkaTemplate).send(eq(InventoryConstants.PURCHASE_ORDERED_TOPIC), any(Purchase.class));
    }

    @Test
    void getPurchaseById_Success() {
        when(purchaseRepository.findById(1L)).thenReturn(Optional.of(purchase));
        when(purchaseMapper.toResponse(purchase)).thenReturn(response);

        PurchaseResponse result = purchaseService.getPurchaseById(1L);

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(5000), result.getTotalAmount());
    }
}
