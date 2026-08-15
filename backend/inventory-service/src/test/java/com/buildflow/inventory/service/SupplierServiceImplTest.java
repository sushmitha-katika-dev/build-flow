package com.buildflow.inventory.service;

import com.buildflow.inventory.dto.request.SupplierCreateRequest;
import com.buildflow.inventory.dto.response.SupplierResponse;
import com.buildflow.inventory.entity.Supplier;
import com.buildflow.inventory.mapper.SupplierMapper;
import com.buildflow.inventory.repository.SupplierRepository;
import com.buildflow.inventory.service.impl.SupplierServiceImpl;
import com.buildflow.inventory.validator.SupplierValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupplierServiceImplTest {

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private SupplierMapper supplierMapper;

    @Mock
    private SupplierValidator supplierValidator;

    @InjectMocks
    private SupplierServiceImpl supplierService;

    private SupplierCreateRequest request;
    private Supplier supplier;
    private SupplierResponse response;

    @BeforeEach
    void setUp() {
        request = new SupplierCreateRequest();
        request.setName("ABC Suppliers");
        request.setContactPerson("John Doe");

        supplier = new Supplier();
        supplier.setId(1L);
        supplier.setName("ABC Suppliers");

        response = new SupplierResponse();
        response.setId(1L);
        response.setName("ABC Suppliers");
    }

    @Test
    void addSupplier_Success() {
        doNothing().when(supplierValidator).validateCreateRequest(any());
        when(supplierMapper.toEntity(any())).thenReturn(supplier);
        when(supplierRepository.save(any(Supplier.class))).thenReturn(supplier);
        when(supplierMapper.toResponse(any(Supplier.class))).thenReturn(response);

        SupplierResponse result = supplierService.addSupplier(request);

        assertNotNull(result);
        assertEquals("ABC Suppliers", result.getName());
    }

    @Test
    void getSupplierById_Success() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(supplierMapper.toResponse(supplier)).thenReturn(response);

        SupplierResponse result = supplierService.getSupplierById(1L);

        assertNotNull(result);
        assertEquals("ABC Suppliers", result.getName());
    }
}
