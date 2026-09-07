package com.buildflow.workforce.service.impl;

import com.buildflow.workforce.client.ProjectClient;
import com.buildflow.workforce.constants.WorkforceConstants;
import com.buildflow.workforce.dto.request.WageCreateRequest;
import com.buildflow.workforce.dto.request.WageUpdateRequest;
import com.buildflow.workforce.dto.response.WageResponse;
import com.buildflow.workforce.entity.Wage;
import com.buildflow.workforce.enums.WageStatus;
import com.buildflow.workforce.event.WageEvent;
import com.buildflow.workforce.exception.ResourceNotFoundException;
import com.buildflow.workforce.mapper.WageMapper;
import com.buildflow.workforce.repository.LabourRepository;
import com.buildflow.workforce.repository.WageRepository;
import com.buildflow.workforce.service.WageService;
import com.buildflow.workforce.validator.WageValidator;
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
public class WageServiceImpl implements WageService {

    private final WageRepository wageRepository;
    private final LabourRepository labourRepository;
    private final WageMapper wageMapper;
    private final WageValidator wageValidator;
    private final ProjectClient projectClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public WageResponse recordWage(WageCreateRequest request) {
        log.info("Recording wage for labour: {}", request.getLabourId());

        if (request.getProjectId() != null && request.getProjectId() > 0) {
            projectClient.validateProjectIsActive(request.getProjectId());
        }

        if (!labourRepository.existsById(request.getLabourId())) {
            throw new ResourceNotFoundException("Labour not found with id: " + request.getLabourId());
        }

        wageValidator.validateCreateRequest(request);

        Wage wage = wageMapper.toEntity(request);
        wage.setStatus(WageStatus.ACTIVE);
        wage = wageRepository.save(wage);

        try {
            WageEvent event = WageEvent.builder()
                    .id(wage.getId())
                    .labourId(wage.getLabourId())
                    .agreementId(wage.getAgreementId())
                    .projectId(wage.getProjectId())
                    .amountPaid(wage.getAmountPaid())
                    .paymentDate(wage.getPaymentDate())
                    .status("PROCESSED")
                    .eventType("PROCESSED")
                    .build();

            kafkaTemplate.send(WorkforceConstants.WAGE_PROCESSED_TOPIC, event);
        } catch (Exception e) {
            log.error("Failed to send wage processed event", e);
        }

        return wageMapper.toResponse(wage);
    }

    @Override
    @Transactional(readOnly = true)
    public WageResponse getWageById(Long id) {
        Wage wage = wageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wage record not found with id: " + id));
        return wageMapper.toResponse(wage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WageResponse> getWagesByLabourId(Long labourId) {
        return wageRepository.findByLabourId(labourId).stream()
                .map(wageMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WageResponse> getWagesByProjectId(Long projectId) {
        return wageRepository.findByProjectId(projectId).stream()
                .map(wageMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WageResponse updateWage(Long id, WageUpdateRequest request) {
        log.info("Updating wage id: {}", id);

        Wage wage = wageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wage record not found with id: " + id));

        if (wage.getProjectId() != null && wage.getProjectId() > 0) {
            projectClient.validateProjectIsActive(wage.getProjectId());
        }

        if (request.getAmountPaid() != null) {
            wage.setAmountPaid(request.getAmountPaid());
        }
        if (request.getPaymentDate() != null) {
            wage.setPaymentDate(request.getPaymentDate());
        }

        wage = wageRepository.save(wage);
        return wageMapper.toResponse(wage);
    }

    @Override
    @Transactional
    public WageResponse cancelWage(Long id) {
        log.info("Cancelling wage id: {}", id);
        
        Wage wage = wageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wage record not found with id: " + id));

        if (wage.getStatus() == WageStatus.CANCELLED) {
            throw new IllegalArgumentException("Wage record is already cancelled");
        }

        wage.setStatus(WageStatus.CANCELLED);
        wage = wageRepository.save(wage);

        try {
            WageEvent event = WageEvent.builder()
                    .id(wage.getId())
                    .labourId(wage.getLabourId())
                    .agreementId(wage.getAgreementId())
                    .projectId(wage.getProjectId())
                    .amountPaid(wage.getAmountPaid())
                    .paymentDate(wage.getPaymentDate())
                    .status("CANCELLED")
                    .eventType("CANCELLED")
                    .build();

            kafkaTemplate.send("wage-cancelled", event);
        } catch (Exception e) {
            log.error("Failed to send wage cancelled event", e);
        }

        return wageMapper.toResponse(wage);
    }

    @Override
    @Transactional
    public void bulkCancelWages(List<Long> ids) {
        log.info("Bulk cancelling wage records: {}", ids);
        for (Long id : ids) {
            cancelWage(id);
        }
    }
}
