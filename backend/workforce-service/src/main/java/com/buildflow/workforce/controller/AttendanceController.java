package com.buildflow.workforce.controller;

import com.buildflow.workforce.dto.request.AttendanceRequest;
import com.buildflow.workforce.dto.response.AttendanceResponse;
import com.buildflow.workforce.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workforce/attendance")
@Tag(name = "Attendance", description = "Endpoints for managing labour attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    @Operation(summary = "Record attendance", description = "Records attendance for a labourer")
    public ResponseEntity<AttendanceResponse> recordAttendance(@Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceService.recordAttendance(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get attendance by ID", description = "Retrieves an attendance record by its ID")
    public ResponseEntity<AttendanceResponse> getAttendanceById(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getAttendanceById(id));
    }

    @GetMapping("/labour/{labourId}")
    @Operation(summary = "Get attendance by labourer", description = "Retrieves all attendance records for a specific labourer")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByLabourId(@PathVariable Long labourId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByLabourId(labourId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update attendance", description = "Updates an existing attendance record by ID")
    public ResponseEntity<AttendanceResponse> updateAttendance(@PathVariable Long id, @Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.updateAttendance(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete attendance", description = "Deletes an attendance record by ID")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }
}
