package com.buildflow.workforce.service.impl;

import com.buildflow.workforce.dto.request.LabourRequest;
import com.buildflow.workforce.dto.response.LabourResponse;
import com.buildflow.workforce.entity.Labour;
import com.buildflow.workforce.exception.ResourceNotFoundException;
import com.buildflow.workforce.repository.LabourRepository;
import com.buildflow.workforce.service.LabourService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LabourServiceImpl implements LabourService {

    private final LabourRepository labourRepository;

    public LabourServiceImpl(LabourRepository labourRepository) {
        this.labourRepository = labourRepository;
    }

    @Override
    public LabourResponse createLabour(LabourRequest request) {
        if (labourRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Labour with email already exists");
        }

        Labour labour = Labour.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole())
                .projectId(request.getProjectId())
                .status(request.getStatus())
                .build();

        Labour savedLabour = labourRepository.save(labour);
        return mapToResponse(savedLabour);
    }

    @Override
    public LabourResponse getLabourById(Long id) {
        Labour labour = labourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found with id: " + id));
        return mapToResponse(labour);
    }

    @Override
    public List<LabourResponse> getAllLabours() {
        return labourRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<LabourResponse> getLaboursByProjectId(Long projectId) {
        return labourRepository.findByProjectId(projectId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public LabourResponse updateLabour(Long id, LabourRequest request) {
        Labour labour = labourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found with id: " + id));

        if (!labour.getEmail().equals(request.getEmail()) && labourRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Labour with email already exists");
        }

        labour.setFirstName(request.getFirstName());
        labour.setLastName(request.getLastName());
        labour.setEmail(request.getEmail());
        labour.setPhoneNumber(request.getPhoneNumber());
        labour.setRole(request.getRole());
        labour.setProjectId(request.getProjectId());
        labour.setStatus(request.getStatus());

        Labour updatedLabour = labourRepository.save(labour);
        return mapToResponse(updatedLabour);
    }

    @Override
    public void deleteLabour(Long id) {
        if (!labourRepository.existsById(id)) {
            throw new ResourceNotFoundException("Labour not found with id: " + id);
        }
        labourRepository.deleteById(id);
    }

    private LabourResponse mapToResponse(Labour labour) {
        return LabourResponse.builder()
                .id(labour.getId())
                .firstName(labour.getFirstName())
                .lastName(labour.getLastName())
                .email(labour.getEmail())
                .phoneNumber(labour.getPhoneNumber())
                .role(labour.getRole())
                .projectId(labour.getProjectId())
                .status(labour.getStatus())
                .createdAt(labour.getCreatedAt())
                .updatedAt(labour.getUpdatedAt())
                .build();
    }
}
