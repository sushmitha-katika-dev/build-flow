package com.buildflow.workforce.service;

import com.buildflow.workforce.dto.request.AttendanceCreateRequest;
import com.buildflow.workforce.dto.request.AttendanceUpdateRequest;
import com.buildflow.workforce.dto.response.AttendanceResponse;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    AttendanceResponse logAttendance(AttendanceCreateRequest request);
    AttendanceResponse getAttendanceById(Long id);
    List<AttendanceResponse> getAttendanceByLabourId(Long labourId);
    List<AttendanceResponse> getAttendanceByDate(LocalDate date);
    AttendanceResponse updateAttendance(Long id, AttendanceUpdateRequest request);
}
