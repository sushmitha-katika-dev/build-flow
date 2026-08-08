package com.buildflow.workforce.service.impl;

import com.buildflow.workforce.constants.WorkforceConstants;
import com.buildflow.workforce.dto.request.LabourCreateRequest;
import com.buildflow.workforce.dto.request.LabourUpdateRequest;
import com.buildflow.workforce.dto.response.LabourResponse;
import com.buildflow.workforce.entity.Labour;
import com.buildflow.workforce.enums.LabourStatus;
import com.buildflow.workforce.exception.ResourceNotFoundException;
import com.buildflow.workforce.mapper.LabourMapper;
import com.buildflow.workforce.repository.LabourRepository;
import com.buildflow.workforce.service.LabourService;
import com.buildflow.workforce.validator.LabourValidator;
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
public class LabourServiceImpl implements LabourService {

    private final LabourRepository labourRepository;
    private final LabourMapper labourMapper;
    private final LabourValidator labourValidator;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public LabourResponse onboardLabour(LabourCreateRequest request) {
        log.info("Onboarding new labour: {} {}", request.getFirstName(), request.getLastName());
        
        labourValidator.validateCreateRequest(request);

        Labour labour = labourMapper.toEntity(request);
        labour.setStatus(LabourStatus.ACTIVE);

        labour = labourRepository.save(labour);

        kafkaTemplate.send(WorkforceConstants.LABOUR_ONBOARDED_TOPIC, labour);

        return labourMapper.toResponse(labour);
    }

    @Override
    @Transactional(readOnly = true)
    public LabourResponse getLabourById(Long id) {
        Labour labour = labourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found with id: " + id));
        return labourMapper.toResponse(labour);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabourResponse> getAllLabour() {
        return labourRepository.findAll().stream()
                .map(labourMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabourResponse> getLabourByProject(Long projectId) {
        return labourRepository.findByProjectId(projectId).stream()
                .map(labourMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LabourResponse updateLabour(Long id, LabourUpdateRequest request) {
        Labour labour = labourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found with id: " + id));

        labourValidator.validateUpdateRequest(request, labour);

        if (request.getFirstName() != null) labour.setFirstName(request.getFirstName());
        if (request.getLastName() != null) labour.setLastName(request.getLastName());
        if (request.getEmail() != null) labour.setEmail(request.getEmail());
        if (request.getPhoneNumber() != null) labour.setPhoneNumber(request.getPhoneNumber());
        if (request.getRole() != null) labour.setRole(request.getRole());
        if (request.getProjectId() != null) labour.setProjectId(request.getProjectId());
        if (request.getStatus() != null) labour.setStatus(request.getStatus());

        labour = labourRepository.save(labour);
        return labourMapper.toResponse(labour);
    }

    @Override
    @Transactional
    public LabourResponse updateLabourStatus(Long id, LabourStatus status) {
        Labour labour = labourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found with id: " + id));
        
        labour.setStatus(status);
        labour = labourRepository.save(labour);
        
        return labourMapper.toResponse(labour);
    }
}
