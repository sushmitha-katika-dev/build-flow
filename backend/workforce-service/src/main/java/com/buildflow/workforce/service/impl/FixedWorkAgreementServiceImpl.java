package com.buildflow.workforce.service.impl;

import com.buildflow.workforce.dto.request.FixedWorkAgreementCreateRequest;
import com.buildflow.workforce.dto.request.FixedWorkAgreementUpdateRequest;
import com.buildflow.workforce.dto.response.FixedWorkAgreementResponse;
import com.buildflow.workforce.entity.FixedWorkAgreement;
import com.buildflow.workforce.entity.Wage;
import com.buildflow.workforce.enums.FixedWorkStatus;
import com.buildflow.workforce.enums.PaymentStatus;
import com.buildflow.workforce.event.FixedWorkAgreementEvent;
import com.buildflow.workforce.constants.WorkforceConstants;
import com.buildflow.workforce.exception.ResourceNotFoundException;
import com.buildflow.workforce.repository.FixedWorkAgreementRepository;
import com.buildflow.workforce.repository.WageRepository;
import com.buildflow.workforce.service.FixedWorkAgreementService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FixedWorkAgreementServiceImpl implements FixedWorkAgreementService {

    private final FixedWorkAgreementRepository fixedWorkAgreementRepository;
    private final WageRepository wageRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public FixedWorkAgreementResponse createAgreement(FixedWorkAgreementCreateRequest request) {
        FixedWorkAgreement agreement = FixedWorkAgreement.builder()
                .labourId(request.getLabourId())
                .projectId(request.getProjectId())
                .description(request.getDescription())
                .agreedAmount(request.getAgreedAmount())
                .status(FixedWorkStatus.ACTIVE)
                .build();
        
        agreement = fixedWorkAgreementRepository.save(agreement);
        
        FixedWorkAgreementEvent event = FixedWorkAgreementEvent.builder()
                .id(agreement.getId())
                .labourId(agreement.getLabourId())
                .projectId(agreement.getProjectId())
                .agreedAmount(agreement.getAgreedAmount())
                .status(agreement.getStatus().name())
                .eventType("CREATED")
                .build();
                
        kafkaTemplate.send(WorkforceConstants.FIXED_WORK_AGREEMENT_CREATED_TOPIC, event);
        
        return toResponse(agreement);
    }

    @Override
    @Transactional(readOnly = true)
    public FixedWorkAgreementResponse getAgreementById(Long id) {
        FixedWorkAgreement agreement = fixedWorkAgreementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agreement not found"));
        return toResponse(agreement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FixedWorkAgreementResponse> getAgreementsByLabour(Long labourId) {
        return fixedWorkAgreementRepository.findByLabourId(labourId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FixedWorkAgreementResponse> getAgreementsByProject(Long projectId) {
        return fixedWorkAgreementRepository.findByProjectId(projectId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FixedWorkAgreementResponse> getAgreementsByLabourAndProject(Long labourId, Long projectId) {
        return fixedWorkAgreementRepository.findByLabourIdAndProjectId(labourId, projectId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FixedWorkAgreementResponse updateAgreement(Long id, FixedWorkAgreementUpdateRequest request) {
        FixedWorkAgreement agreement = fixedWorkAgreementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agreement not found"));
                
        agreement.setDescription(request.getDescription());
        agreement.setAgreedAmount(request.getAgreedAmount());
        
        agreement = fixedWorkAgreementRepository.save(agreement);
        
        FixedWorkAgreementEvent event = FixedWorkAgreementEvent.builder()
                .id(agreement.getId())
                .labourId(agreement.getLabourId())
                .projectId(agreement.getProjectId())
                .agreedAmount(agreement.getAgreedAmount())
                .status(agreement.getStatus().name())
                .eventType("UPDATED")
                .build();
                
        kafkaTemplate.send(WorkforceConstants.FIXED_WORK_AGREEMENT_UPDATED_TOPIC, event);
        
        return toResponse(agreement);
    }

    @Override
    @Transactional
    public FixedWorkAgreementResponse updateAgreementStatus(Long id, FixedWorkStatus status) {
        FixedWorkAgreement agreement = fixedWorkAgreementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agreement not found"));
                
        agreement.setStatus(status);
        agreement = fixedWorkAgreementRepository.save(agreement);
        
        if (status == FixedWorkStatus.CANCELLED) {
            FixedWorkAgreementEvent event = FixedWorkAgreementEvent.builder()
                    .id(agreement.getId())
                    .labourId(agreement.getLabourId())
                    .projectId(agreement.getProjectId())
                    .agreedAmount(agreement.getAgreedAmount())
                    .status(status.name())
                    .eventType("CANCELLED")
                    .build();
            kafkaTemplate.send(WorkforceConstants.FIXED_WORK_AGREEMENT_UPDATED_TOPIC.replace("updated", "cancelled"), event);
        }
        
        return toResponse(agreement);
    }

    private FixedWorkAgreementResponse toResponse(FixedWorkAgreement agreement) {
        List<Wage> wages = wageRepository.findByAgreementId(agreement.getId());
        BigDecimal totalPaid = wages.stream()
                .filter(w -> w.getStatus() == com.buildflow.workforce.enums.WageStatus.ACTIVE)
                .map(Wage::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal outstanding = agreement.getAgreedAmount().subtract(totalPaid);
        PaymentStatus paymentStatus;
        if (totalPaid.compareTo(BigDecimal.ZERO) == 0) {
            paymentStatus = PaymentStatus.PENDING;
        } else if (outstanding.compareTo(BigDecimal.ZERO) <= 0) {
            paymentStatus = PaymentStatus.COMPLETED;
            outstanding = BigDecimal.ZERO; // Prevent negative outstanding in UI
        } else {
            paymentStatus = PaymentStatus.PARTIAL;
        }

        return FixedWorkAgreementResponse.builder()
                .id(agreement.getId())
                .labourId(agreement.getLabourId())
                .projectId(agreement.getProjectId())
                .description(agreement.getDescription())
                .agreedAmount(agreement.getAgreedAmount())
                .status(agreement.getStatus())
                .paymentStatus(paymentStatus)
                .amountPaid(totalPaid)
                .outstandingAmount(outstanding)
                .createdAt(agreement.getCreatedAt())
                .updatedAt(agreement.getUpdatedAt())
                .build();
    }
}
