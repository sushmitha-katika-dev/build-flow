package com.buildflow.workforce.validator;

import com.buildflow.workforce.dto.request.AttendanceCreateRequest;
import com.buildflow.workforce.dto.request.AttendanceUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class AttendanceValidator {

    public void validateCreateRequest(AttendanceCreateRequest request) {
        if (request.getCheckInTime() != null && request.getCheckOutTime() != null) {
            if (request.getCheckOutTime().isBefore(request.getCheckInTime())) {
                throw new IllegalArgumentException("Check-out time cannot be before check-in time");
            }
        }
    }

    public void validateUpdateRequest(AttendanceUpdateRequest request, com.buildflow.workforce.entity.Attendance attendance) {
        if (request.getCheckInTime() != null && request.getCheckOutTime() != null) {
            if (request.getCheckOutTime().isBefore(request.getCheckInTime())) {
                throw new IllegalArgumentException("Check-out time cannot be before check-in time");
            }
        }
    }
}
