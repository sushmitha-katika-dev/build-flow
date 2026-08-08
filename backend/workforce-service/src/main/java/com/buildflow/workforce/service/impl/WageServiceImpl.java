package com.buildflow.workforce.service.impl;

import com.buildflow.workforce.dto.request.WageRequest;
import com.buildflow.workforce.dto.response.WageResponse;
import com.buildflow.workforce.entity.Wage;
import com.buildflow.workforce.exception.ResourceNotFoundException;
import com.buildflow.workforce.repository.LabourRepository;
import com.buildflow.workforce.repository.WageRepository;
import com.buildflow.workforce.service.WageService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WageServiceImpl implements WageService {

    private final WageRepository wageRepository;
    private final LabourRepository labourRepository;

    public WageServiceImpl(WageRepository wageRepository, LabourRepository labourRepository) {
        this.wageRepository = wageRepository;
        this.labourRepository = labourRepository;
    }

    @Override
    public WageResponse recordWage(WageRequest request) {
        if (!labourRepository.existsById(request.getLabourId())) {
            throw new ResourceNotFoundException("Labour not found with id: " + request.getLabourId());
        }

        Wage wage = Wage.builder()
                .labourId(request.getLabourId())
                .projectId(request.getProjectId())
                .hourlyRate(request.getHourlyRate())
                .totalHours(request.getTotalHours())
                .amountPaid(request.getAmountPaid())
                .paymentDate(request.getPaymentDate())
                .build();

        Wage savedWage = wageRepository.save(wage);
        return mapToResponse(savedWage);
    }

    @Override
    public WageResponse getWageById(Long id) {
        Wage wage = wageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wage not found with id: " + id));
        return mapToResponse(wage);
    }

    @Override
    public List<WageResponse> getWagesByLabourId(Long labourId) {
        return wageRepository.findByLabourId(labourId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<WageResponse> getWagesByProjectId(Long projectId) {
        return wageRepository.findByProjectId(projectId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public WageResponse updateWage(Long id, WageRequest request) {
        Wage wage = wageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wage not found with id: " + id));

        if (!wage.getLabourId().equals(request.getLabourId()) && !labourRepository.existsById(request.getLabourId())) {
            throw new ResourceNotFoundException("Labour not found with id: " + request.getLabourId());
        }

        wage.setLabourId(request.getLabourId());
        wage.setProjectId(request.getProjectId());
        wage.setHourlyRate(request.getHourlyRate());
        wage.setTotalHours(request.getTotalHours());
        wage.setAmountPaid(request.getAmountPaid());
        wage.setPaymentDate(request.getPaymentDate());

        Wage updatedWage = wageRepository.save(wage);
        return mapToResponse(updatedWage);
    }

    @Override
    public void deleteWage(Long id) {
        if (!wageRepository.existsById(id)) {
            throw new ResourceNotFoundException("Wage not found with id: " + id);
        }
        wageRepository.deleteById(id);
    }

    private WageResponse mapToResponse(Wage wage) {
        return WageResponse.builder()
                .id(wage.getId())
                .labourId(wage.getLabourId())
                .projectId(wage.getProjectId())
                .hourlyRate(wage.getHourlyRate())
                .totalHours(wage.getTotalHours())
                .amountPaid(wage.getAmountPaid())
                .paymentDate(wage.getPaymentDate())
                .createdAt(wage.getCreatedAt())
                .updatedAt(wage.getUpdatedAt())
                .build();
    }
}
