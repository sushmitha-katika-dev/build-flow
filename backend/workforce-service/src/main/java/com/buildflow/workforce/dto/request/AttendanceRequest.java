package com.buildflow.workforce.dto.request;

import com.buildflow.workforce.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequest {

    @NotNull(message = "Labour ID cannot be null")
    private Long labourId;

    @NotNull(message = "Date cannot be null")
    private LocalDate date;

    @NotNull(message = "Status cannot be null")
    private AttendanceStatus status;

    private LocalTime checkInTime;
    private LocalTime checkOutTime;
}
