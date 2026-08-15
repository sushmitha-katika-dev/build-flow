package com.buildflow.workforce.dto.request;

import com.buildflow.workforce.enums.AttendanceStatus;
import lombok.Data;

import java.time.LocalTime;

@Data
public class AttendanceUpdateRequest {

    private Long projectId;

    private AttendanceStatus status;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
}
