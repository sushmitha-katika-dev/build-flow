package com.buildflow.inventory.service;

import com.buildflow.inventory.dto.request.SupplierRequest;
import com.buildflow.inventory.dto.response.SupplierResponse;
import com.buildflow.inventory.entity.Supplier;
import com.buildflow.inventory.repository.SupplierRepository;
import com.buildflow.inventory.service.impl.SupplierServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupplierServiceImplTest {

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private SupplierServiceImpl supplierService;

    private Supplier supplier;
    private SupplierRequest supplierRequest;

    @BeforeEach
    void setUp() {
        supplier = Supplier.builder()
                .id(1L)
                .name("ABC Supplies")
                .email("abc@supplies.com")
                .phone("1234567890")
                .build();

        supplierRequest = new SupplierRequest();
        supplierRequest.setName("ABC Supplies");
        supplierRequest.setEmail("abc@supplies.com");
        supplierRequest.setPhone("1234567890");
    }

    @Test
    void createSupplier_Success() {
        when(supplierRepository.existsByEmail("abc@supplies.com")).thenReturn(false);
        when(supplierRepository.save(any(Supplier.class))).thenReturn(supplier);

        SupplierResponse response = supplierService.createSupplier(supplierRequest);

        assertNotNull(response);
        assertEquals("ABC Supplies", response.getName());
    }

    @Test
    void getSupplierById_Success() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));

        SupplierResponse response = supplierService.getSupplierById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }
}
