package com.buildflow.workforce.service;

import com.buildflow.workforce.dto.request.AttendanceRequest;
import com.buildflow.workforce.dto.response.AttendanceResponse;

import java.util.List;

public interface AttendanceService {
    AttendanceResponse recordAttendance(AttendanceRequest request);
    AttendanceResponse getAttendanceById(Long id);
    List<AttendanceResponse> getAttendanceByLabourId(Long labourId);
    AttendanceResponse updateAttendance(Long id, AttendanceRequest request);
    void deleteAttendance(Long id);
}
