package com.buildflow.inventory.service.impl;

import com.buildflow.inventory.dto.request.SupplierCreateRequest;
import com.buildflow.inventory.dto.request.SupplierUpdateRequest;
import com.buildflow.inventory.dto.response.SupplierResponse;
import com.buildflow.inventory.entity.Supplier;
import com.buildflow.inventory.exception.ResourceNotFoundException;
import com.buildflow.inventory.mapper.SupplierMapper;
import com.buildflow.inventory.repository.SupplierRepository;
import com.buildflow.inventory.service.SupplierService;
import com.buildflow.inventory.validator.SupplierValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;
    private final SupplierValidator supplierValidator;

    @Override
    @Transactional
    public SupplierResponse addSupplier(SupplierCreateRequest request) {
        log.info("Adding new supplier: {}", request.getName());

        supplierValidator.validateCreateRequest(request);

        Supplier supplier = supplierMapper.toEntity(request);
        supplier = supplierRepository.save(supplier);

        return supplierMapper.toResponse(supplier);
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return supplierMapper.toResponse(supplier);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(supplierMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SupplierResponse updateSupplier(Long id, SupplierUpdateRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        supplierValidator.validateUpdateRequest(request, supplier);

        if (request.getName() != null) supplier.setName(request.getName());
        if (request.getContactPerson() != null) supplier.setContactPerson(request.getContactPerson());
        if (request.getEmail() != null) supplier.setEmail(request.getEmail());
        if (request.getPhoneNumber() != null) supplier.setPhone(request.getPhoneNumber());
        if (request.getAddress() != null) supplier.setAddress(request.getAddress());

        supplier = supplierRepository.save(supplier);
        return supplierMapper.toResponse(supplier);
    }
}
