package com.buildflow.workforce.service.impl;

import com.buildflow.workforce.client.ProjectClient;
import com.buildflow.workforce.constants.WorkforceConstants;
import com.buildflow.workforce.dto.request.LabourCreateRequest;
import com.buildflow.workforce.dto.request.LabourUpdateRequest;
import com.buildflow.workforce.dto.response.LabourResponse;
import com.buildflow.workforce.dto.response.LabourWorkforceSummaryResponse;
import com.buildflow.workforce.entity.Attendance;
import com.buildflow.workforce.entity.FixedWorkAgreement;
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

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
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
    private final ProjectClient projectClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public LabourResponse onboardLabour(LabourCreateRequest request) {
        log.info("Onboarding new labour: {} {}", request.getFirstName(), request.getLastName());

        if (request.getProjectId() != null && request.getProjectId() > 0) {
            projectClient.validateProjectIsActive(request.getProjectId());
        }

        labourValidator.validateCreateRequest(request);

        Labour labour = labourMapper.toEntity(request);
        labour.setStatus(LabourStatus.AVAILABLE);

        labour = labourRepository.save(labour);

        try {
            kafkaTemplate.send(WorkforceConstants.LABOUR_ONBOARDED_TOPIC, labour);
        } catch (Exception e) {
            log.error("Failed to send labour onboarded event", e);
        }

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
    public List<LabourWorkforceSummaryResponse> getLabourSummary() {
        return labourRepository.findAll().stream()
                .map(labour -> buildSummary(labour, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabourWorkforceSummaryResponse> getLabourSummaryByProject(Long projectId) {
        Set<Long> labourIds = new LinkedHashSet<>();
        labourRepository.findByProjectId(projectId).forEach(l -> labourIds.add(l.getId()));
        attendanceRepository.findByProjectId(projectId).forEach(a -> labourIds.add(a.getLabourId()));
        fixedWorkAgreementRepository.findByProjectId(projectId).forEach(f -> labourIds.add(f.getLabourId()));
        wageRepository.findByProjectId(projectId).forEach(w -> labourIds.add(w.getLabourId()));

        List<Labour> labourers = labourRepository.findAllById(labourIds);
        return labourers.stream()
                .map(labour -> buildSummary(labour, projectId))
                .collect(Collectors.toList());
    }

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

        BigDecimal daysWorked = BigDecimal.ZERO;
        BigDecimal totalEarned = BigDecimal.ZERO;

        if (labour.getCompensationType() == CompensationType.DAILY) {
            BigDecimal baseDailyRate = labour.getDailyRate() != null ? labour.getDailyRate() : BigDecimal.ZERO;
            for (Attendance att : attendances) {
                BigDecimal effectiveRate = att.getDailyRate() != null ? att.getDailyRate() : baseDailyRate;
                if (att.getStatus() == AttendanceStatus.PRESENT) {
                    daysWorked = daysWorked.add(BigDecimal.ONE);
                    totalEarned = totalEarned.add(effectiveRate);
                } else if (att.getStatus() == AttendanceStatus.HALF_DAY) {
                    daysWorked = daysWorked.add(new BigDecimal("0.5"));
                    totalEarned = totalEarned.add(effectiveRate.multiply(new BigDecimal("0.5")));
                }
            }
        } else if (labour.getCompensationType() == CompensationType.FIXED_WORK) {
            List<FixedWorkAgreement> agreements;
            if (projectId != null) {
                agreements = fixedWorkAgreementRepository.findByLabourIdAndProjectId(labour.getId(), projectId);
            } else {
                agreements = fixedWorkAgreementRepository.findByLabourId(labour.getId());
            }

            for (FixedWorkAgreement ag : agreements) {
                if (ag.getAgreedAmount() != null) {
                    totalEarned = totalEarned.add(ag.getAgreedAmount());
                }
            }
            long presentCount = attendances.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.HALF_DAY)
                    .count();
            daysWorked = BigDecimal.valueOf(presentCount);
        } else if (labour.getCompensationType() == CompensationType.MONTHLY) {
            totalEarned = labour.getMonthlySalary() != null ? labour.getMonthlySalary() : BigDecimal.ZERO;
            long presentCount = attendances.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.HALF_DAY)
                    .count();
            daysWorked = BigDecimal.valueOf(presentCount);
        }

        BigDecimal amountPaid = wages.stream()
                .filter(w -> w.getStatus() == WageStatus.ACTIVE)
                .map(Wage::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remainingAmount = totalEarned.subtract(amountPaid);
        if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) {
            remainingAmount = BigDecimal.ZERO;
        }

        PaymentStatus paymentStatus = PaymentStatus.PENDING;
        if (amountPaid.compareTo(BigDecimal.ZERO) > 0) {
            if (remainingAmount.compareTo(BigDecimal.ZERO) == 0 && totalEarned.compareTo(BigDecimal.ZERO) > 0) {
                paymentStatus = PaymentStatus.COMPLETED;
            } else {
                paymentStatus = PaymentStatus.PARTIAL;
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
                .paymentStatus(paymentStatus)
                .build();
    }

    @Override
    @Transactional
    public LabourResponse updateLabour(Long id, LabourUpdateRequest request) {
        log.info("Updating labour id: {}", id);
        
        Labour labour = labourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found with id: " + id));

        labourValidator.validateUpdateRequest(request, labour);

        if (request.getFirstName() != null) labour.setFirstName(request.getFirstName());
        if (request.getLastName() != null) labour.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) labour.setPhoneNumber(request.getPhoneNumber());
        if (request.getGender() != null) labour.setGender(request.getGender());
        if (request.getRole() != null) labour.setRole(request.getRole());
        if (request.getCompensationType() != null) labour.setCompensationType(request.getCompensationType());
        if (request.getDailyRate() != null) labour.setDailyRate(request.getDailyRate());
        if (request.getMonthlySalary() != null) labour.setMonthlySalary(request.getMonthlySalary());
        if (request.getProjectId() != null) labour.setProjectId(request.getProjectId());
        if (request.getStatus() != null) labour.setStatus(request.getStatus());

        labour = labourRepository.save(labour);

        return labourMapper.toResponse(labour);
    }

    @Override
    @Transactional
    public LabourResponse updateLabourStatus(Long id, LabourStatus status) {
        log.info("Updating status for labour id: {} to {}", id, status);

        Labour labour = labourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found with id: " + id));

        labour.setStatus(status);
        labour = labourRepository.save(labour);

        return labourMapper.toResponse(labour);
    }

    @Override
    @Transactional
    public LabourResponse deleteLabour(Long id) {
        log.info("Requesting delete for labour id: {}", id);

        Labour labour = labourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found with id: " + id));

        boolean hasAttendance = !attendanceRepository.findByLabourId(id).isEmpty();
        boolean hasWages = !wageRepository.findByLabourId(id).isEmpty();
        boolean hasAgreements = !fixedWorkAgreementRepository.findByLabourId(id).isEmpty();

        if (hasAttendance || hasWages || hasAgreements) {
            log.info("Labour id {} has historical attendance/wage/agreement records. Setting status to INACTIVE.", id);
            labour.setStatus(LabourStatus.INACTIVE);
            labour = labourRepository.save(labour);
        } else {
            log.info("Labour id {} has no historical records. Performing hard delete from DB.", id);
            labourRepository.delete(labour);
        }

        return labourMapper.toResponse(labour);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabourResponse> getLabourByProject(Long projectId) {
        return labourRepository.findByProjectId(projectId).stream()
                .map(labourMapper::toResponse)
                .collect(Collectors.toList());
    }
}
