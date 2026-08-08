package com.buildflow.workforce.controller;

import com.buildflow.workforce.dto.request.AttendanceCreateRequest;
import com.buildflow.workforce.dto.request.AttendanceUpdateRequest;
import com.buildflow.workforce.dto.response.AttendanceResponse;
import com.buildflow.workforce.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/workforce/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Attendance Management API")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    @Operation(summary = "Log daily attendance")
    public ResponseEntity<AttendanceResponse> logAttendance(@Valid @RequestBody AttendanceCreateRequest request) {
        return new ResponseEntity<>(attendanceService.logAttendance(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get attendance by ID")
    public ResponseEntity<AttendanceResponse> getAttendanceById(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getAttendanceById(id));
    }

    @GetMapping("/labour/{labourId}")
    @Operation(summary = "Get attendance history for a specific labour")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByLabourId(@PathVariable Long labourId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByLabourId(labourId));
    }

    @GetMapping("/date/{date}")
    @Operation(summary = "Get attendance for a specific date")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByDate(date));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update attendance record")
    public ResponseEntity<AttendanceResponse> updateAttendance(
            @PathVariable Long id, 
            @Valid @RequestBody AttendanceUpdateRequest request) {
        return ResponseEntity.ok(attendanceService.updateAttendance(id, request));
    }
}
