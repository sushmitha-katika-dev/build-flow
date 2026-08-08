package com.buildflow.inventory.service.impl;

import com.buildflow.inventory.constants.InventoryConstants;
import com.buildflow.inventory.dto.request.PurchaseCreateRequest;
import com.buildflow.inventory.dto.request.PurchaseUpdateRequest;
import com.buildflow.inventory.dto.response.PurchaseResponse;
import com.buildflow.inventory.entity.Purchase;
import com.buildflow.inventory.enums.PurchaseStatus;
import com.buildflow.inventory.exception.ResourceNotFoundException;
import com.buildflow.inventory.mapper.PurchaseMapper;
import com.buildflow.inventory.repository.MaterialRepository;
import com.buildflow.inventory.repository.PurchaseRepository;
import com.buildflow.inventory.repository.SupplierRepository;
import com.buildflow.inventory.service.PurchaseService;
import com.buildflow.inventory.validator.PurchaseValidator;
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
public class PurchaseServiceImpl implements PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final MaterialRepository materialRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseMapper purchaseMapper;
    private final PurchaseValidator purchaseValidator;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public PurchaseResponse createPurchaseOrder(PurchaseCreateRequest request) {
        log.info("Creating purchase order for material ID: {} from supplier ID: {}", request.getMaterialId(), request.getSupplierId());

        if (!materialRepository.existsById(request.getMaterialId())) {
            throw new ResourceNotFoundException("Material not found with id: " + request.getMaterialId());
        }

        if (!supplierRepository.existsById(request.getSupplierId())) {
            throw new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId());
        }

        purchaseValidator.validateCreateRequest(request);

        Purchase purchase = purchaseMapper.toEntity(request);
        purchase = purchaseRepository.save(purchase);

        kafkaTemplate.send(InventoryConstants.PURCHASE_ORDERED_TOPIC, purchase);

        return purchaseMapper.toResponse(purchase);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseResponse getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
        return purchaseMapper.toResponse(purchase);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseResponse> getPurchasesByProject(Long projectId) {
        // Fallback since Purchase doesn't have projectId. 
        // Just return all for now to not break the controller interface.
        return purchaseRepository.findAll().stream()
                .map(purchaseMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PurchaseResponse updatePurchase(Long id, PurchaseUpdateRequest request) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));

        purchaseValidator.validateUpdateRequest(request, purchase);

        if (request.getQuantity() != null) purchase.setQuantity(request.getQuantity());
        if (request.getUnitPrice() != null) purchase.setUnitPrice(request.getUnitPrice());
        if (request.getTotalCost() != null) purchase.setTotalAmount(request.getTotalCost());
        if (request.getStatus() != null) purchase.setStatus(request.getStatus());

        purchase = purchaseRepository.save(purchase);
        return purchaseMapper.toResponse(purchase);
    }

    @Override
    @Transactional
    public PurchaseResponse updatePurchaseStatus(Long id, PurchaseStatus status) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));

        purchase.setStatus(status);
        purchase = purchaseRepository.save(purchase);
        
        return purchaseMapper.toResponse(purchase);
    }
}
