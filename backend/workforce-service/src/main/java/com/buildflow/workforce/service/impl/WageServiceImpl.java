package com.buildflow.workforce.service.impl;

import com.buildflow.workforce.constants.WorkforceConstants;
import com.buildflow.workforce.dto.request.WageCreateRequest;
import com.buildflow.workforce.dto.request.WageUpdateRequest;
import com.buildflow.workforce.dto.response.WageResponse;
import com.buildflow.workforce.entity.Wage;
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
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public WageResponse recordWage(WageCreateRequest request) {
        log.info("Recording wage for labour: {} on project: {}", request.getLabourId(), request.getProjectId());

        if (!labourRepository.existsById(request.getLabourId())) {
            throw new ResourceNotFoundException("Labour not found with id: " + request.getLabourId());
        }

        wageValidator.validateCreateRequest(request);

        Wage wage = wageMapper.toEntity(request);
        wage = wageRepository.save(wage);

        kafkaTemplate.send(WorkforceConstants.WAGE_PROCESSED_TOPIC, wage);

        return wageMapper.toResponse(wage);
    }

    @Override
    @Transactional(readOnly = true)
    public WageResponse getWageById(Long id) {
        Wage wage = wageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wage not found with id: " + id));
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
        Wage wage = wageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wage not found with id: " + id));

        wageValidator.validateUpdateRequest(request, wage);

        if (request.getHourlyRate() != null) wage.setHourlyRate(request.getHourlyRate());
        if (request.getTotalHours() != null) wage.setTotalHours(request.getTotalHours());
        if (request.getAmountPaid() != null) wage.setAmountPaid(request.getAmountPaid());
        if (request.getPaymentDate() != null) wage.setPaymentDate(request.getPaymentDate());

        wage = wageRepository.save(wage);
        return wageMapper.toResponse(wage);
    }
}
