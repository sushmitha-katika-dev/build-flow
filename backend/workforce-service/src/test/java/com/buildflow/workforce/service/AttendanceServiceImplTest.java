package com.buildflow.workforce.service;

import com.buildflow.workforce.constants.WorkforceConstants;
import com.buildflow.workforce.dto.request.AttendanceCreateRequest;
import com.buildflow.workforce.dto.response.AttendanceResponse;
import com.buildflow.workforce.entity.Attendance;
import com.buildflow.workforce.enums.AttendanceStatus;
import com.buildflow.workforce.exception.ResourceNotFoundException;
import com.buildflow.workforce.mapper.AttendanceMapper;
import com.buildflow.workforce.repository.AttendanceRepository;
import com.buildflow.workforce.repository.LabourRepository;
import com.buildflow.workforce.service.impl.AttendanceServiceImpl;
import com.buildflow.workforce.validator.AttendanceValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceImplTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private LabourRepository labourRepository;

    @Mock
    private AttendanceMapper attendanceMapper;

    @Mock
    private AttendanceValidator attendanceValidator;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private AttendanceServiceImpl attendanceService;

    private AttendanceCreateRequest createRequest;
    private Attendance attendance;
    private AttendanceResponse response;

    @BeforeEach
    void setUp() {
        createRequest = new AttendanceCreateRequest();
        createRequest.setLabourId(1L);
        createRequest.setDate(LocalDate.now());
        createRequest.setStatus(AttendanceStatus.PRESENT);

        attendance = new Attendance();
        attendance.setId(1L);
        attendance.setLabourId(1L);
        attendance.setDate(LocalDate.now());
        attendance.setStatus(AttendanceStatus.PRESENT);

        response = new AttendanceResponse();
        response.setId(1L);
        response.setLabourId(1L);
        response.setStatus(AttendanceStatus.PRESENT);
    }

    @Test
    void logAttendance_Success() {
        when(labourRepository.existsById(1L)).thenReturn(true);
        doNothing().when(attendanceValidator).validateCreateRequest(any());
        when(attendanceMapper.toEntity(any())).thenReturn(attendance);
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(attendance);
        when(attendanceMapper.toResponse(any(Attendance.class))).thenReturn(response);

        AttendanceResponse result = attendanceService.logAttendance(createRequest);

        assertNotNull(result);
        assertEquals(AttendanceStatus.PRESENT, result.getStatus());
        verify(kafkaTemplate).send(eq(WorkforceConstants.ATTENDANCE_LOGGED_TOPIC), any(Attendance.class));
    }

    @Test
    void logAttendance_LabourNotFound_ThrowsException() {
        when(labourRepository.existsById(1L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> attendanceService.logAttendance(createRequest));
        verify(attendanceRepository, never()).save(any());
    }

    @Test
    void getAttendanceById_Success() {
        when(attendanceRepository.findById(1L)).thenReturn(Optional.of(attendance));
        when(attendanceMapper.toResponse(attendance)).thenReturn(response);

        AttendanceResponse result = attendanceService.getAttendanceById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getLabourId());
    }
}
