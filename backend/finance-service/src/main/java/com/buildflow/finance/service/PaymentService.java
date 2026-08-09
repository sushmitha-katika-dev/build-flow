package com.buildflow.finance.service;

import com.buildflow.finance.dto.request.PaymentRequest;
import com.buildflow.finance.dto.response.PaymentResponse;

import java.util.List;

public interface PaymentService {
    PaymentResponse addPayment(PaymentRequest request);
    PaymentResponse updatePayment(Long id, PaymentRequest request);
    PaymentResponse getPaymentById(Long id);
    List<PaymentResponse> getPaymentsByProjectId(Long projectId);
    void deletePayment(Long id);
}
