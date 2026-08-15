package com.buildflow.finance.controller;

import com.buildflow.finance.dto.request.PaymentRequest;
import com.buildflow.finance.dto.response.PaymentResponse;
import com.buildflow.finance.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment API", description = "API for managing incoming project payments (advances, milestones)")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Record a new payment")
    public ResponseEntity<PaymentResponse> addPayment(@Valid @RequestBody PaymentRequest request) {
        return new ResponseEntity<>(paymentService.addPayment(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a payment")
    public ResponseEntity<PaymentResponse> updatePayment(@PathVariable Long id, @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.updatePayment(id, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get all payments for a project")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(paymentService.getPaymentsByProjectId(projectId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a payment")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}
