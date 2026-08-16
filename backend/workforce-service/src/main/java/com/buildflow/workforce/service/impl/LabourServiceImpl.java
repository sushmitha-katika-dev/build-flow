package com.buildflow.workforce.service.impl;

import com.buildflow.workforce.constants.WorkforceConstants;
import com.buildflow.workforce.dto.request.LabourCreateRequest;
import com.buildflow.workforce.dto.request.LabourUpdateRequest;
import com.buildflow.workforce.dto.response.LabourResponse;
import com.buildflow.workforce.dto.response.LabourWorkforceSummaryResponse;
import com.buildflow.workforce.entity.Attendance;
import com.buildflow.workforce.entity.Labour;
import com.buildflow.workforce.entity.Wage;
import com.buildflow.workforce.enums.AttendanceStatus;
import com.buildflow.workforce.enums.CompensationType;
import com.buildflow.workforce.enums.LabourStatus;
import com.buildflow.workforce.enums.PaymentStatus;
import com.buildflow.workforce.enums.WageStatus;
import com.buildflow.workforce.exception.ResourceNotFoundException;
import com.buildflow.workforce.mapper.LabourMapper;
import com.buildflow.workforce.repository.AttendanceRepository;
import com.buildflow.workforce.repository.FixedWorkAgreementRepository;
import com.buildflow.workforce.repository.LabourRepository;
import com.buildflow.workforce.repository.WageRepository;
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
    private final AttendanceRepository attendanceRepository;
    private final WageRepository wageRepository;
    private final FixedWorkAgreementRepository fixedWorkAgreementRepository;
    private final LabourMapper labourMapper;
    private final LabourValidator labourValidator;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public LabourResponse onboardLabour(LabourCreateRequest request) {
        log.info("Onboarding new labour: {} {}", request.getFirstName(), request.getLastName());

        labourValidator.validateCreateRequest(request);

        Labour labour = labourMapper.toEntity(request);
        labour.setStatus(LabourStatus.AVAILABLE);

        labour = labourRepository.save(labour);

        kafkaTemplate.send(WorkforceConstants.LABOUR_ONBOARDED_TOPIC, labour);

        return labourMapper.toResponse(labour);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabourWorkforceSummaryResponse> getLabourSummary() {
        return labourRepository.findAll().stream()
                .map(labour -> buildSummary(labour, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabourWorkforceSummaryResponse> getLabourSummaryByProject(Long projectId) {
        return labourRepository.findByProjectId(projectId).stream()
                .map(labour -> buildSummary(labour, projectId))
                .collect(Collectors.toList());
    }

    @Transactional
    private LabourWorkforceSummaryResponse buildSummary(Labour labour, Long projectId) {
        List<Attendance> attendances = attendanceRepository.findByLabourId(labour.getId());
        List<Wage> wages = wageRepository.findByLabourId(labour.getId());

        if (projectId != null) {
            attendances = attendances.stream()
                    .filter(a -> projectId.equals(a.getProjectId()))
                    .collect(Collectors.toList());
            wages = wages.stream()
                    .filter(w -> projectId.equals(w.getProjectId()))
                    .collect(Collectors.toList());
        }

        java.math.BigDecimal daysWorked = java.math.BigDecimal.ZERO;
        for (Attendance a : attendances) {
            if (a.getStatus() == AttendanceStatus.PRESENT) {
                daysWorked = daysWorked.add(java.math.BigDecimal.ONE);
            } else if (a.getStatus() == AttendanceStatus.HALF_DAY) {
                daysWorked = daysWorked.add(new java.math.BigDecimal("0.5"));
            }
        }

        java.math.BigDecimal totalEarned = java.math.BigDecimal.ZERO;

        if (labour.getCompensationType() == CompensationType.DAILY) {
            java.math.BigDecimal dailyRate = labour.getDailyRate() != null ? labour.getDailyRate() : java.math.BigDecimal.ZERO;
            totalEarned = dailyRate.multiply(daysWorked);
        } else if (labour.getCompensationType() == CompensationType.FIXED_WORK) {
            List<com.buildflow.workforce.entity.FixedWorkAgreement> agreements;
            if (projectId != null) {
                agreements = fixedWorkAgreementRepository.findByLabourIdAndProjectId(labour.getId(), projectId);
            } else if (labour.getProjectId() != null) {
                agreements = fixedWorkAgreementRepository.findByLabourIdAndProjectId(labour.getId(), labour.getProjectId());
            } else {
                agreements = fixedWorkAgreementRepository.findByLabourId(labour.getId());
            }
            for (com.buildflow.workforce.entity.FixedWorkAgreement agreement : agreements) {
                if (agreement.getStatus() != com.buildflow.workforce.enums.FixedWorkStatus.CANCELLED) {
                    totalEarned = totalEarned.add(agreement.getAgreedAmount());
                }
            }
        } else if (labour.getCompensationType() == CompensationType.MONTHLY) {
            totalEarned = labour.getMonthlySalary() != null ? labour.getMonthlySalary() : java.math.BigDecimal.ZERO;
        }

        java.math.BigDecimal amountPaid = java.math.BigDecimal.ZERO;
        for (Wage w : wages) {
            if (w.getStatus() != WageStatus.CANCELLED) {
                amountPaid = amountPaid.add(w.getAmountPaid());
            }
        }

        java.math.BigDecimal remainingAmount = totalEarned.subtract(amountPaid);
        if (remainingAmount.compareTo(java.math.BigDecimal.ZERO) < 0) {
            remainingAmount = java.math.BigDecimal.ZERO; // Prevent negative remaining if overpaid
        }

        PaymentStatus status = PaymentStatus.PENDING;
        if (amountPaid.compareTo(java.math.BigDecimal.ZERO) > 0) {
            if (amountPaid.compareTo(totalEarned) >= 0) {
                status = PaymentStatus.COMPLETED;
            } else {
                status = PaymentStatus.PARTIAL;
            }
        }

        return LabourWorkforceSummaryResponse.builder()
                .id(labour.getId())
                .firstName(labour.getFirstName())
                .lastName(labour.getLastName())
                .gender(labour.getGender())
                .role(labour.getRole())
                .projectId(labour.getProjectId())
                .compensationType(labour.getCompensationType())
                .dailyRate(labour.getDailyRate())
                .monthlySalary(labour.getMonthlySalary())
                .daysWorked(daysWorked)
                .totalEarned(totalEarned)
                .amountPaid(amountPaid)
                .remainingAmount(remainingAmount)
                .paymentStatus(status)
                .build();
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

        if (request.getFirstName() != null)
            labour.setFirstName(request.getFirstName());
        if (request.getLastName() != null)
            labour.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null)
            labour.setPhoneNumber(request.getPhoneNumber());
        if (request.getGender() != null) labour.setGender(request.getGender());
        if (request.getRole() != null) labour.setRole(request.getRole());
        if (request.getCompensationType() != null) labour.setCompensationType(request.getCompensationType());
        if (request.getDailyRate() != null) labour.setDailyRate(request.getDailyRate());
        if (request.getMonthlySalary() != null) labour.setMonthlySalary(request.getMonthlySalary());
        if (request.getProjectId() != null) labour.setProjectId(request.getProjectId());
        if (request.getStatus() != null)
            labour.setStatus(request.getStatus());

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
