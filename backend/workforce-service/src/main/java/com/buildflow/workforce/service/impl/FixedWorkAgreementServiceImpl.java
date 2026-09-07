package com.buildflow.workforce.service.impl;

import com.buildflow.workforce.client.ProjectClient;
import com.buildflow.workforce.constants.WorkforceConstants;
import com.buildflow.workforce.dto.request.FixedWorkAgreementCreateRequest;
import com.buildflow.workforce.dto.request.FixedWorkAgreementUpdateRequest;
import com.buildflow.workforce.dto.response.FixedWorkAgreementResponse;
import com.buildflow.workforce.entity.FixedWorkAgreement;
import com.buildflow.workforce.enums.FixedWorkStatus;
import com.buildflow.workforce.enums.PaymentStatus;
import com.buildflow.workforce.event.FixedWorkAgreementEvent;
import com.buildflow.workforce.exception.ResourceNotFoundException;
import com.buildflow.workforce.repository.FixedWorkAgreementRepository;
import com.buildflow.workforce.repository.LabourRepository;
import com.buildflow.workforce.repository.WageRepository;
import com.buildflow.workforce.service.FixedWorkAgreementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FixedWorkAgreementServiceImpl implements FixedWorkAgreementService {

    private final FixedWorkAgreementRepository agreementRepository;
    private final LabourRepository labourRepository;
    private final WageRepository wageRepository;
    private final ProjectClient projectClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public FixedWorkAgreementResponse createAgreement(FixedWorkAgreementCreateRequest request) {
        log.info("Creating fixed work agreement for labour: {} on project: {}", request.getLabourId(), request.getProjectId());

        if (request.getProjectId() != null && request.getProjectId() > 0) {
            projectClient.validateProjectIsActive(request.getProjectId());
        }

        if (!labourRepository.existsById(request.getLabourId())) {
            throw new ResourceNotFoundException("Labour not found with id: " + request.getLabourId());
        }

        FixedWorkAgreement agreement = FixedWorkAgreement.builder()
                .labourId(request.getLabourId())
                .projectId(request.getProjectId())
                .description(request.getDescription())
                .agreedAmount(request.getAgreedAmount())
                .status(FixedWorkStatus.ACTIVE)
                .build();

        agreement = agreementRepository.save(agreement);

        try {
            FixedWorkAgreementEvent event = FixedWorkAgreementEvent.builder()
                    .id(agreement.getId())
                    .labourId(agreement.getLabourId())
                    .projectId(agreement.getProjectId())
                    .agreedAmount(agreement.getAgreedAmount())
                    .status("CREATED")
                    .eventType("CREATED")
                    .build();

            kafkaTemplate.send(WorkforceConstants.FIXED_WORK_AGREEMENT_CREATED_TOPIC, event);
        } catch (Exception e) {
            log.error("Failed to send agreement created event", e);
        }

        return buildResponse(agreement);
    }

    @Override
    @Transactional(readOnly = true)
    public FixedWorkAgreementResponse getAgreementById(Long id) {
        FixedWorkAgreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fixed work agreement not found with id: " + id));
        return buildResponse(agreement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FixedWorkAgreementResponse> getAgreementsByLabour(Long labourId) {
        return agreementRepository.findByLabourId(labourId).stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FixedWorkAgreementResponse> getAgreementsByProject(Long projectId) {
        return agreementRepository.findByProjectId(projectId).stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FixedWorkAgreementResponse> getAgreementsByLabourAndProject(Long labourId, Long projectId) {
        return agreementRepository.findByLabourIdAndProjectId(labourId, projectId).stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    private FixedWorkAgreementResponse buildResponse(FixedWorkAgreement agreement) {
        BigDecimal amountPaid = wageRepository.findByAgreementId(agreement.getId()).stream()
                .map(w -> w.getAmountPaid())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal outstanding = agreement.getAgreedAmount().subtract(amountPaid);
        if (outstanding.compareTo(BigDecimal.ZERO) < 0) {
            outstanding = BigDecimal.ZERO;
        }

        PaymentStatus paymentStatus = PaymentStatus.PENDING;
        if (amountPaid.compareTo(BigDecimal.ZERO) > 0) {
            if (outstanding.compareTo(BigDecimal.ZERO) == 0) {
                paymentStatus = PaymentStatus.COMPLETED;
            } else {
                paymentStatus = PaymentStatus.PARTIAL;
            }
        }

        return FixedWorkAgreementResponse.builder()
                .id(agreement.getId())
                .labourId(agreement.getLabourId())
                .projectId(agreement.getProjectId())
                .description(agreement.getDescription())
                .agreedAmount(agreement.getAgreedAmount())
                .status(agreement.getStatus())
                .amountPaid(amountPaid)
                .outstandingAmount(outstanding)
                .paymentStatus(paymentStatus)
                .build();
    }

    @Override
    @Transactional
    public FixedWorkAgreementResponse updateAgreement(Long id, FixedWorkAgreementUpdateRequest request) {
        log.info("Updating fixed work agreement id: {}", id);

        FixedWorkAgreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fixed work agreement not found with id: " + id));

        if (agreement.getProjectId() != null && agreement.getProjectId() > 0) {
            projectClient.validateProjectIsActive(agreement.getProjectId());
        }

        if (request.getDescription() != null) {
            agreement.setDescription(request.getDescription());
        }
        if (request.getAgreedAmount() != null) {
            agreement.setAgreedAmount(request.getAgreedAmount());
        }

        agreement = agreementRepository.save(agreement);

        try {
            FixedWorkAgreementEvent event = FixedWorkAgreementEvent.builder()
                    .id(agreement.getId())
                    .labourId(agreement.getLabourId())
                    .projectId(agreement.getProjectId())
                    .agreedAmount(agreement.getAgreedAmount())
                    .status(agreement.getStatus().name())
                    .eventType("UPDATED")
                    .build();

            kafkaTemplate.send("fixed-work-agreement-updated", event);
        } catch (Exception e) {
            log.error("Failed to send agreement updated event", e);
        }

        return buildResponse(agreement);
    }

    @Override
    @Transactional
    public FixedWorkAgreementResponse updateAgreementStatus(Long id, FixedWorkStatus status) {
        log.info("Updating status for fixed work agreement id: {} to {}", id, status);

        FixedWorkAgreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fixed work agreement not found with id: " + id));

        agreement.setStatus(status);
        agreement = agreementRepository.save(agreement);

        try {
            FixedWorkAgreementEvent event = FixedWorkAgreementEvent.builder()
                    .id(agreement.getId())
                    .labourId(agreement.getLabourId())
                    .projectId(agreement.getProjectId())
                    .agreedAmount(agreement.getAgreedAmount())
                    .status(status.name())
                    .eventType("STATUS_UPDATED")
                    .build();

            kafkaTemplate.send("fixed-work-agreement-updated", event);
        } catch (Exception e) {
            log.error("Failed to send agreement status updated event", e);
        }

        return buildResponse(agreement);
    }
}
