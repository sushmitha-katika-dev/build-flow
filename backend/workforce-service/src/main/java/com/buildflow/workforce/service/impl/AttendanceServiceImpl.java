package com.buildflow.workforce.service.impl;

import com.buildflow.workforce.client.ProjectClient;
import com.buildflow.workforce.dto.request.AttendanceCreateRequest;
import com.buildflow.workforce.dto.request.AttendanceUpdateRequest;
import com.buildflow.workforce.dto.response.AttendanceResponse;
import com.buildflow.workforce.entity.Attendance;
import com.buildflow.workforce.entity.Labour;
import com.buildflow.workforce.event.AttendanceEvent;
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
import java.time.LocalDateTime;
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
    private final ProjectClient projectClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public AttendanceResponse logAttendance(AttendanceCreateRequest request) {
        log.info("Logging attendance for labour: {} on date: {}", request.getLabourId(), request.getDate());

        Labour labour = labourRepository.findById(request.getLabourId())
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found with id: " + request.getLabourId()));

        Long targetProjectId = request.getProjectId() != null ? request.getProjectId() : labour.getProjectId();
        if (targetProjectId != null && targetProjectId > 0) {
            projectClient.validateProjectIsActive(targetProjectId);
        }

        Optional<Attendance> existing = attendanceRepository.findByDate(request.getDate()).stream()
                .filter(a -> a.getLabourId().equals(request.getLabourId()))
                .findFirst();
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Attendance already logged for this date");
        }

        attendanceValidator.validateCreateRequest(request);

        Attendance attendance = attendanceMapper.toEntity(request);
        if (attendance.getProjectId() == null) {
            attendance.setProjectId(labour.getProjectId());
        }
        if (attendance.getDailyRate() == null && labour.getDailyRate() != null) {
            attendance.setDailyRate(labour.getDailyRate());
        }
        attendance = attendanceRepository.save(attendance);
        
        AttendanceResponse response = attendanceMapper.toResponse(attendance);
        
        try {
            AttendanceEvent event = AttendanceEvent.builder()
                    .id(response.getId())
                    .labourId(response.getLabourId())
                    .projectId(response.getProjectId())
                    .date(response.getDate())
                    .status(response.getStatus().name())
                    .earned(response.getEarned())
                    .eventType("LOGGED")
                    .build();
            kafkaTemplate.send("attendance-logged", event);
        } catch (Exception e) {
            log.error("Failed to send attendance-logged event", e);
        }
        
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + id));
        return attendanceMapper.toResponse(attendance);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByLabourId(Long labourId) {
        return attendanceRepository.findByLabourId(labourId).stream()
                .map(attendanceMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByProjectId(Long projectId) {
        return attendanceRepository.findByProjectId(projectId).stream()
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
        log.info("Updating attendance id: {}", id);
        
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + id));

        Long targetProjectId = request.getProjectId() != null ? request.getProjectId() : attendance.getProjectId();
        if (targetProjectId != null && targetProjectId > 0) {
            projectClient.validateProjectIsActive(targetProjectId);
        }

        if (request.getProjectId() != null) {
            attendance.setProjectId(request.getProjectId());
        }
        if (request.getStatus() != null) {
            attendance.setStatus(request.getStatus());
        }

        attendance = attendanceRepository.save(attendance);
        
        AttendanceResponse response = attendanceMapper.toResponse(attendance);
        
        try {
            AttendanceEvent event = AttendanceEvent.builder()
                    .id(response.getId())
                    .labourId(response.getLabourId())
                    .projectId(response.getProjectId())
                    .date(response.getDate())
                    .status(response.getStatus().name())
                    .earned(response.getEarned())
                    .eventType("UPDATED")
                    .build();
            kafkaTemplate.send("attendance-updated", event);
        } catch (Exception e) {
            log.error("Failed to send attendance-updated event", e);
        }
        
        return response;
    }

    @Override
    @Transactional
    public void deleteAttendance(Long id) {
        log.info("Deleting attendance id: {}", id);
        
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + id));
                
        attendanceRepository.delete(attendance);
        
        try {
            AttendanceEvent event = AttendanceEvent.builder()
                    .id(id)
                    .labourId(attendance.getLabourId())
                    .projectId(attendance.getProjectId())
                    .date(attendance.getDate())
                    .status("DELETED")
                    .eventType("DELETED")
                    .build();
            kafkaTemplate.send("attendance-deleted", event);
        } catch (Exception e) {
            log.error("Failed to send attendance-deleted event", e);
        }
    }

    @Override
    @Transactional
    public void bulkDeleteAttendance(List<Long> ids) {
        log.info("Bulk deleting attendance records: {}", ids);
        for (Long id : ids) {
            deleteAttendance(id);
        }
    }
}
