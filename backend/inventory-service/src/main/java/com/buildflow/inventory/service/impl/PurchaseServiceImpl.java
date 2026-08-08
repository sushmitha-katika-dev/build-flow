package com.buildflow.inventory.service.impl;

import com.buildflow.inventory.dto.request.PurchaseRequest;
import com.buildflow.inventory.dto.response.PurchaseResponse;
import com.buildflow.inventory.entity.Purchase;
import com.buildflow.inventory.enums.PurchaseStatus;
import com.buildflow.inventory.exception.ResourceNotFoundException;
import com.buildflow.inventory.repository.MaterialRepository;
import com.buildflow.inventory.repository.PurchaseRepository;
import com.buildflow.inventory.repository.SupplierRepository;
import com.buildflow.inventory.service.PurchaseService;
import com.buildflow.inventory.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseServiceImpl implements PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final MaterialRepository materialRepository;
    private final SupplierRepository supplierRepository;
    private final StockService stockService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public PurchaseResponse recordPurchase(PurchaseRequest request) {
        if (!materialRepository.existsById(request.getMaterialId())) {
            throw new ResourceNotFoundException("Material not found with id: " + request.getMaterialId());
        }
        if (!supplierRepository.existsById(request.getSupplierId())) {
            throw new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId());
        }

        BigDecimal totalAmount = request.getQuantity().multiply(request.getUnitPrice());

        Purchase purchase = Purchase.builder()
                .materialId(request.getMaterialId())
                .supplierId(request.getSupplierId())
                .quantity(request.getQuantity())
                .unitPrice(request.getUnitPrice())
                .totalAmount(totalAmount)
                .purchaseDate(request.getPurchaseDate())
                .status(request.getStatus())
                .build();

        Purchase savedPurchase = purchaseRepository.save(purchase);

        // Emit kafka event
        kafkaTemplate.send("inventory-purchase-recorded", savedPurchase);

        return mapToResponse(savedPurchase);
    }

    @Override
    public PurchaseResponse getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
        return mapToResponse(purchase);
    }

    @Override
    public List<PurchaseResponse> getPurchasesBySupplierId(Long supplierId) {
        return purchaseRepository.findBySupplierId(supplierId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PurchaseResponse updatePurchaseStatus(Long id, PurchaseStatus status) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));

        // If marked as DELIVERED from PENDING, we should ideally auto-stock in.
        // For simplicity, we just update status here. The InventoryTransaction could be recorded separately.
        purchase.setStatus(status);
        Purchase updated = purchaseRepository.save(purchase);

        kafkaTemplate.send("inventory-purchase-status-updated", updated);
        
        return mapToResponse(updated);
    }

    private PurchaseResponse mapToResponse(Purchase purchase) {
        return PurchaseResponse.builder()
                .id(purchase.getId())
                .materialId(purchase.getMaterialId())
                .supplierId(purchase.getSupplierId())
                .quantity(purchase.getQuantity())
                .unitPrice(purchase.getUnitPrice())
                .totalAmount(purchase.getTotalAmount())
                .purchaseDate(purchase.getPurchaseDate())
                .status(purchase.getStatus())
                .createdAt(purchase.getCreatedAt())
                .updatedAt(purchase.getUpdatedAt())
                .build();
    }
}
