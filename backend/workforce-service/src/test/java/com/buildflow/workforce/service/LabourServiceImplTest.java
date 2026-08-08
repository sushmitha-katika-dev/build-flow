package com.buildflow.workforce.service;

import com.buildflow.workforce.dto.request.LabourRequest;
import com.buildflow.workforce.dto.response.LabourResponse;
import com.buildflow.workforce.entity.Labour;
import com.buildflow.workforce.enums.LabourRole;
import com.buildflow.workforce.enums.LabourStatus;
import com.buildflow.workforce.exception.ResourceNotFoundException;
import com.buildflow.workforce.repository.LabourRepository;
import com.buildflow.workforce.service.impl.LabourServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LabourServiceImplTest {

    @Mock
    private LabourRepository labourRepository;

    @InjectMocks
    private LabourServiceImpl labourService;

    private Labour labour;
    private LabourRequest labourRequest;

    @BeforeEach
    void setUp() {
        labour = Labour.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .phoneNumber("1234567890")
                .role(LabourRole.ENGINEER)
                .projectId(10L)
                .status(LabourStatus.ACTIVE)
                .build();

        labourRequest = new LabourRequest(
                "John",
                "Doe",
                "john.doe@example.com",
                "1234567890",
                LabourRole.ENGINEER,
                10L,
                LabourStatus.ACTIVE
        );
    }

    @Test
    void createLabour_Success() {
        when(labourRepository.existsByEmail("john.doe@example.com")).thenReturn(false);
        when(labourRepository.save(any(Labour.class))).thenReturn(labour);

        LabourResponse response = labourService.createLabour(labourRequest);

        assertNotNull(response);
        assertEquals("John", response.getFirstName());
        verify(labourRepository, times(1)).save(any(Labour.class));
    }

    @Test
    void createLabour_EmailExists() {
        when(labourRepository.existsByEmail("john.doe@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> labourService.createLabour(labourRequest));
        verify(labourRepository, never()).save(any(Labour.class));
    }

    @Test
    void getLabourById_Success() {
        when(labourRepository.findById(1L)).thenReturn(Optional.of(labour));

        LabourResponse response = labourService.getLabourById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void getLabourById_NotFound() {
        when(labourRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> labourService.getLabourById(1L));
    }

    @Test
    void getAllLabours_Success() {
        when(labourRepository.findAll()).thenReturn(Arrays.asList(labour));

        List<LabourResponse> responses = labourService.getAllLabours();

        assertNotNull(responses);
        assertEquals(1, responses.size());
    }

    @Test
    void getLaboursByProjectId_Success() {
        when(labourRepository.findByProjectId(10L)).thenReturn(Arrays.asList(labour));

        List<LabourResponse> responses = labourService.getLaboursByProjectId(10L);

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(10L, responses.get(0).getProjectId());
    }

    @Test
    void updateLabour_Success() {
        when(labourRepository.findById(1L)).thenReturn(Optional.of(labour));
        when(labourRepository.save(any(Labour.class))).thenReturn(labour);

        LabourResponse response = labourService.updateLabour(1L, labourRequest);

        assertNotNull(response);
        verify(labourRepository, times(1)).save(any(Labour.class));
    }

    @Test
    void deleteLabour_Success() {
        when(labourRepository.existsById(1L)).thenReturn(true);

        labourService.deleteLabour(1L);

        verify(labourRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteLabour_NotFound() {
        when(labourRepository.existsById(1L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> labourService.deleteLabour(1L));
    }
}
