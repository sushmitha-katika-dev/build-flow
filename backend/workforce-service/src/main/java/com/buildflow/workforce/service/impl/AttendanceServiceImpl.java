package com.buildflow.workforce.service.impl;

import com.buildflow.workforce.constants.WorkforceConstants;
import com.buildflow.workforce.dto.request.AttendanceCreateRequest;
import com.buildflow.workforce.dto.request.AttendanceUpdateRequest;
import com.buildflow.workforce.dto.response.AttendanceResponse;
import com.buildflow.workforce.entity.Attendance;
import com.buildflow.workforce.entity.Labour;
import com.buildflow.workforce.event.AttendanceEvent;
import com.buildflow.workforce.enums.CompensationType;
import com.buildflow.workforce.exception.ResourceNotFoundException;
import com.buildflow.workforce.mapper.AttendanceMapper;
import com.buildflow.workforce.repository.AttendanceRepository;
import com.buildflow.workforce.repository.LabourRepository;
import com.buildflow.workforce.service.AttendanceService;
import com.buildflow.workforce.validator.AttendanceValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final LabourRepository labourRepository;
    private final AttendanceMapper attendanceMapper;
    private final AttendanceValidator attendanceValidator;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public AttendanceResponse logAttendance(AttendanceCreateRequest request) {
        log.info("Logging attendance for labour: {} on date: {}", request.getLabourId(), request.getDate());

        if (!labourRepository.existsById(request.getLabourId())) {
            throw new ResourceNotFoundException("Labour not found with id: " + request.getLabourId());
        }

        Optional<Attendance> existing = attendanceRepository.findByDate(request.getDate()).stream()
                .filter(a -> a.getLabourId().equals(request.getLabourId()))
                .findFirst();
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Attendance already logged for this date");
        }

        attendanceValidator.validateCreateRequest(request);

        Attendance attendance = attendanceMapper.toEntity(request);
        attendance = attendanceRepository.save(attendance);
        
        AttendanceResponse response = enrichWithEarned(attendanceMapper.toResponse(attendance));

        AttendanceEvent event = AttendanceEvent.builder()
                .id(response.getId())
                .labourId(response.getLabourId())
                .projectId(response.getProjectId())
                .date(response.getDate())
                .status(response.getStatus().name())
                .earned(response.getEarned())
                .eventType("LOGGED")
                .build();

        kafkaTemplate.send(WorkforceConstants.ATTENDANCE_LOGGED_TOPIC, event);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));
        return enrichWithEarned(attendanceMapper.toResponse(attendance));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByLabourId(Long labourId) {
        return attendanceRepository.findByLabourId(labourId).stream()
                .map(a -> enrichWithEarned(attendanceMapper.toResponse(a)))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date).stream()
                .map(a -> enrichWithEarned(attendanceMapper.toResponse(a)))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AttendanceResponse updateAttendance(Long id, AttendanceUpdateRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));

        attendanceValidator.validateUpdateRequest(request, attendance);

        if (request.getProjectId() != null)
            attendance.setProjectId(request.getProjectId());
        if (request.getStatus() != null)
            attendance.setStatus(request.getStatus());
        if (request.getCheckInTime() != null)
            attendance.setCheckInTime(request.getCheckInTime());
        if (request.getCheckOutTime() != null)
            attendance.setCheckOutTime(request.getCheckOutTime());

        attendance = attendanceRepository.save(attendance);
        AttendanceResponse response = enrichWithEarned(attendanceMapper.toResponse(attendance));

        AttendanceEvent event = AttendanceEvent.builder()
                .id(response.getId())
                .labourId(response.getLabourId())
                .projectId(response.getProjectId())
                .date(response.getDate())
                .status(response.getStatus().name())
                .earned(response.getEarned())
                .eventType("UPDATED")
                .build();

        kafkaTemplate.send(WorkforceConstants.ATTENDANCE_UPDATED_TOPIC, event);
        return response;
    }

    @Override
    @Transactional
    public void deleteAttendance(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));
        
        attendanceRepository.delete(attendance);
        
        AttendanceResponse response = enrichWithEarned(attendanceMapper.toResponse(attendance));
        AttendanceEvent event = AttendanceEvent.builder()
                .id(response.getId())
                .labourId(response.getLabourId())
                .projectId(response.getProjectId())
                .date(response.getDate())
                .status(response.getStatus().name())
                .earned(response.getEarned())
                .eventType("DELETED")
                .build();
                
        kafkaTemplate.send(WorkforceConstants.ATTENDANCE_DELETED_TOPIC, event);
    }

    @Override
    @Transactional
    public void bulkDeleteAttendance(List<Long> ids) {
        for (Long id : ids) {
            deleteAttendance(id);
        }
    }

    private AttendanceResponse enrichWithEarned(AttendanceResponse response) {
        if (response.getLabourId() == null) return response;
        Labour labour = labourRepository.findById(response.getLabourId()).orElse(null);
        if (labour != null && labour.getCompensationType() == CompensationType.DAILY) {
            BigDecimal dailyRate = labour.getDailyRate() != null ? labour.getDailyRate() : BigDecimal.ZERO;
            if (response.getStatus() == com.buildflow.workforce.enums.AttendanceStatus.PRESENT) {
                response.setEarned(dailyRate);
            } else if (response.getStatus() == com.buildflow.workforce.enums.AttendanceStatus.HALF_DAY) {
                response.setEarned(dailyRate.multiply(new BigDecimal("0.5")));
            } else {
                response.setEarned(BigDecimal.ZERO);
            }
        } else {
            response.setEarned(BigDecimal.ZERO);
        }
        return response;
    }
}
