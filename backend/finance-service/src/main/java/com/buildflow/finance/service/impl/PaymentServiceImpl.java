package com.buildflow.finance.service.impl;

import com.buildflow.finance.constants.FinanceConstants;
import com.buildflow.finance.dto.request.PaymentRequest;
import com.buildflow.finance.dto.response.PaymentResponse;
import com.buildflow.finance.entity.Payment;
import com.buildflow.finance.exception.PaymentNotFoundException;
import com.buildflow.finance.mapper.FinanceMapper;
import com.buildflow.finance.repository.PaymentRepository;
import com.buildflow.finance.service.BudgetService;
import com.buildflow.finance.service.PaymentService;
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
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final FinanceMapper financeMapper;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final BudgetService budgetService;

    @Override
    @Transactional
    public PaymentResponse addPayment(PaymentRequest request) {
        log.info("Adding payment for project id: {}", request.getProjectId());
        
        Payment payment = financeMapper.toEntity(request);
        Payment savedPayment = paymentRepository.save(payment);
        
        PaymentResponse response = financeMapper.toResponse(savedPayment);
        kafkaTemplate.send(FinanceConstants.PAYMENT_RECEIVED_TOPIC, response);
        
        budgetService.updateAmountPaid(request.getProjectId());
        
        return response;
    }

    @Override
    @Transactional
    public PaymentResponse updatePayment(Long id, PaymentRequest request) {
        log.info("Updating payment id: {}", id);
        
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with id: " + id));
                
        financeMapper.updateEntityFromRequest(request, payment);
        Payment updatedPayment = paymentRepository.save(payment);
        
        budgetService.updateAmountPaid(updatedPayment.getProjectId());
        
        return financeMapper.toResponse(updatedPayment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with id: " + id));
        return financeMapper.toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByProjectId(Long projectId) {
        return paymentRepository.findByProjectId(projectId).stream()
                .map(financeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deletePayment(Long id) {
        log.info("Deleting payment id: {}", id);
        if (!paymentRepository.existsById(id)) {
            throw new PaymentNotFoundException("Payment not found with id: " + id);
        }
        Payment payment = paymentRepository.findById(id).get();
        Long projectId = payment.getProjectId();
        
        paymentRepository.deleteById(id);
        
        budgetService.updateAmountPaid(projectId);
    }
}
