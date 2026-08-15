package com.buildflow.workforce.dto.request;

import com.buildflow.workforce.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AttendanceCreateRequest {

    @NotNull(message = "Labour ID cannot be null")
    private Long labourId;

    @NotNull(message = "Date cannot be null")
    private LocalDate date;

    @NotNull(message = "Status cannot be null")
    private AttendanceStatus status;

    private LocalTime checkInTime;
    private LocalTime checkOutTime;
}
