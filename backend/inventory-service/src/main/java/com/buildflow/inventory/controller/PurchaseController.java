package com.buildflow.inventory.controller;

import com.buildflow.inventory.dto.request.PurchaseRequest;
import com.buildflow.inventory.dto.response.PurchaseResponse;
import com.buildflow.inventory.enums.PurchaseStatus;
import com.buildflow.inventory.service.PurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping
    public ResponseEntity<PurchaseResponse> recordPurchase(@Valid @RequestBody PurchaseRequest request) {
        return new ResponseEntity<>(purchaseService.recordPurchase(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseResponse> getPurchaseById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.getPurchaseById(id));
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<PurchaseResponse>> getPurchasesBySupplierId(@PathVariable Long supplierId) {
        return ResponseEntity.ok(purchaseService.getPurchasesBySupplierId(supplierId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PurchaseResponse> updatePurchaseStatus(@PathVariable Long id, @RequestParam PurchaseStatus status) {
        return ResponseEntity.ok(purchaseService.updatePurchaseStatus(id, status));
    }
}
