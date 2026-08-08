package com.buildflow.workforce.service.impl;

import com.buildflow.workforce.dto.request.AttendanceRequest;
import com.buildflow.workforce.dto.response.AttendanceResponse;
import com.buildflow.workforce.entity.Attendance;
import com.buildflow.workforce.exception.ResourceNotFoundException;
import com.buildflow.workforce.repository.AttendanceRepository;
import com.buildflow.workforce.repository.LabourRepository;
import com.buildflow.workforce.service.AttendanceService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final LabourRepository labourRepository;

    public AttendanceServiceImpl(AttendanceRepository attendanceRepository, LabourRepository labourRepository) {
        this.attendanceRepository = attendanceRepository;
        this.labourRepository = labourRepository;
    }

    @Override
    public AttendanceResponse recordAttendance(AttendanceRequest request) {
        if (!labourRepository.existsById(request.getLabourId())) {
            throw new ResourceNotFoundException("Labour not found with id: " + request.getLabourId());
        }

        Attendance attendance = Attendance.builder()
                .labourId(request.getLabourId())
                .date(request.getDate())
                .status(request.getStatus())
                .checkInTime(request.getCheckInTime())
                .checkOutTime(request.getCheckOutTime())
                .build();

        Attendance savedAttendance = attendanceRepository.save(attendance);
        return mapToResponse(savedAttendance);
    }

    @Override
    public AttendanceResponse getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));
        return mapToResponse(attendance);
    }

    @Override
    public List<AttendanceResponse> getAttendanceByLabourId(Long labourId) {
        return attendanceRepository.findByLabourId(labourId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public AttendanceResponse updateAttendance(Long id, AttendanceRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));

        if (!attendance.getLabourId().equals(request.getLabourId()) && !labourRepository.existsById(request.getLabourId())) {
            throw new ResourceNotFoundException("Labour not found with id: " + request.getLabourId());
        }

        attendance.setLabourId(request.getLabourId());
        attendance.setDate(request.getDate());
        attendance.setStatus(request.getStatus());
        attendance.setCheckInTime(request.getCheckInTime());
        attendance.setCheckOutTime(request.getCheckOutTime());

        Attendance updatedAttendance = attendanceRepository.save(attendance);
        return mapToResponse(updatedAttendance);
    }

    @Override
    public void deleteAttendance(Long id) {
        if (!attendanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Attendance not found with id: " + id);
        }
        attendanceRepository.deleteById(id);
    }

    private AttendanceResponse mapToResponse(Attendance attendance) {
        return AttendanceResponse.builder()
                .id(attendance.getId())
                .labourId(attendance.getLabourId())
                .date(attendance.getDate())
                .status(attendance.getStatus())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .createdAt(attendance.getCreatedAt())
                .updatedAt(attendance.getUpdatedAt())
                .build();
    }
}
