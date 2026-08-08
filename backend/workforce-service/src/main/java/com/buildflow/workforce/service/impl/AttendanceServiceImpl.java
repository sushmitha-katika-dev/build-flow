package com.buildflow.workforce.service.impl;

import com.buildflow.workforce.constants.WorkforceConstants;
import com.buildflow.workforce.dto.request.AttendanceCreateRequest;
import com.buildflow.workforce.dto.request.AttendanceUpdateRequest;
import com.buildflow.workforce.dto.response.AttendanceResponse;
import com.buildflow.workforce.entity.Attendance;
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

import java.time.LocalDate;
import java.util.List;
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

        attendanceValidator.validateCreateRequest(request);

        Attendance attendance = attendanceMapper.toEntity(request);
        attendance = attendanceRepository.save(attendance);

        kafkaTemplate.send(WorkforceConstants.ATTENDANCE_LOGGED_TOPIC, attendance);

        return attendanceMapper.toResponse(attendance);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));
        return attendanceMapper.toResponse(attendance);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByLabourId(Long labourId) {
        return attendanceRepository.findByLabourId(labourId).stream()
                .map(attendanceMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date).stream()
                .map(attendanceMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AttendanceResponse updateAttendance(Long id, AttendanceUpdateRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));

        attendanceValidator.validateUpdateRequest(request, attendance);

        if (request.getStatus() != null) attendance.setStatus(request.getStatus());
        if (request.getCheckInTime() != null) attendance.setCheckInTime(request.getCheckInTime());
        if (request.getCheckOutTime() != null) attendance.setCheckOutTime(request.getCheckOutTime());

        attendance = attendanceRepository.save(attendance);
        return attendanceMapper.toResponse(attendance);
    }
}
