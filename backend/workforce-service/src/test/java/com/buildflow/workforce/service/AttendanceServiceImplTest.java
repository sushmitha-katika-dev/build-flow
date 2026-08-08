package com.buildflow.workforce.service;

import com.buildflow.workforce.dto.request.AttendanceRequest;
import com.buildflow.workforce.dto.response.AttendanceResponse;
import com.buildflow.workforce.entity.Attendance;
import com.buildflow.workforce.enums.AttendanceStatus;
import com.buildflow.workforce.exception.ResourceNotFoundException;
import com.buildflow.workforce.repository.AttendanceRepository;
import com.buildflow.workforce.repository.LabourRepository;
import com.buildflow.workforce.service.impl.AttendanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AttendanceServiceImplTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private LabourRepository labourRepository;

    @InjectMocks
    private AttendanceServiceImpl attendanceService;

    private Attendance attendance;
    private AttendanceRequest attendanceRequest;

    @BeforeEach
    void setUp() {
        attendance = Attendance.builder()
                .id(1L)
                .labourId(1L)
                .date(LocalDate.now())
                .status(AttendanceStatus.PRESENT)
                .checkInTime(LocalTime.of(8, 0))
                .checkOutTime(LocalTime.of(17, 0))
                .build();

        attendanceRequest = new AttendanceRequest(
                1L,
                LocalDate.now(),
                AttendanceStatus.PRESENT,
                LocalTime.of(8, 0),
                LocalTime.of(17, 0)
        );
    }

    @Test
    void recordAttendance_Success() {
        when(labourRepository.existsById(1L)).thenReturn(true);
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(attendance);

        AttendanceResponse response = attendanceService.recordAttendance(attendanceRequest);

        assertNotNull(response);
        assertEquals(1L, response.getLabourId());
        verify(attendanceRepository, times(1)).save(any(Attendance.class));
    }

    @Test
    void recordAttendance_LabourNotFound() {
        when(labourRepository.existsById(1L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> attendanceService.recordAttendance(attendanceRequest));
        verify(attendanceRepository, never()).save(any(Attendance.class));
    }

    @Test
    void getAttendanceById_Success() {
        when(attendanceRepository.findById(1L)).thenReturn(Optional.of(attendance));

        AttendanceResponse response = attendanceService.getAttendanceById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void getAttendanceByLabourId_Success() {
        when(attendanceRepository.findByLabourId(1L)).thenReturn(Arrays.asList(attendance));

        List<AttendanceResponse> responses = attendanceService.getAttendanceByLabourId(1L);

        assertNotNull(responses);
        assertEquals(1, responses.size());
    }
}
