package com.buildflow.workforce.service;

import com.buildflow.workforce.dto.WorkerRequest;
import com.buildflow.workforce.dto.WorkerResponse;
import com.buildflow.workforce.entity.Worker;
import com.buildflow.workforce.enums.WorkerRole;
import com.buildflow.workforce.enums.WorkerStatus;
import com.buildflow.workforce.exception.WorkerNotFoundException;
import com.buildflow.workforce.repository.WorkerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WorkerServiceImplTest {

    @Mock
    private WorkerRepository workerRepository;

    @InjectMocks
    private WorkerServiceImpl workerService;

    private Worker worker;
    private WorkerRequest workerRequest;

    @BeforeEach
    void setUp() {
        worker = Worker.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .phoneNumber("1234567890")
                .role(WorkerRole.ENGINEER)
                .projectId(10L)
                .hourlyRate(new BigDecimal("50.00"))
                .status(WorkerStatus.ACTIVE)
                .build();

        workerRequest = new WorkerRequest(
                "John",
                "Doe",
                "john.doe@example.com",
                "1234567890",
                WorkerRole.ENGINEER,
                10L,
                new BigDecimal("50.00"),
                WorkerStatus.ACTIVE
        );
    }

    @Test
    void createWorker_Success() {
        when(workerRepository.existsByEmail("john.doe@example.com")).thenReturn(false);
        when(workerRepository.save(any(Worker.class))).thenReturn(worker);

        WorkerResponse response = workerService.createWorker(workerRequest);

        assertNotNull(response);
        assertEquals("John", response.getFirstName());
        verify(workerRepository, times(1)).save(any(Worker.class));
    }

    @Test
    void createWorker_EmailExists() {
        when(workerRepository.existsByEmail("john.doe@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> workerService.createWorker(workerRequest));
        verify(workerRepository, never()).save(any(Worker.class));
    }

    @Test
    void getWorkerById_Success() {
        when(workerRepository.findById(1L)).thenReturn(Optional.of(worker));

        WorkerResponse response = workerService.getWorkerById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void getWorkerById_NotFound() {
        when(workerRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(WorkerNotFoundException.class, () -> workerService.getWorkerById(1L));
    }

    @Test
    void getAllWorkers_Success() {
        when(workerRepository.findAll()).thenReturn(Arrays.asList(worker));

        List<WorkerResponse> responses = workerService.getAllWorkers();

        assertNotNull(responses);
        assertEquals(1, responses.size());
    }

    @Test
    void getWorkersByProjectId_Success() {
        when(workerRepository.findByProjectId(10L)).thenReturn(Arrays.asList(worker));

        List<WorkerResponse> responses = workerService.getWorkersByProjectId(10L);

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(10L, responses.get(0).getProjectId());
    }

    @Test
    void updateWorker_Success() {
        when(workerRepository.findById(1L)).thenReturn(Optional.of(worker));
        when(workerRepository.save(any(Worker.class))).thenReturn(worker);

        WorkerResponse response = workerService.updateWorker(1L, workerRequest);

        assertNotNull(response);
        verify(workerRepository, times(1)).save(any(Worker.class));
    }

    @Test
    void deleteWorker_Success() {
        when(workerRepository.existsById(1L)).thenReturn(true);

        workerService.deleteWorker(1L);

        verify(workerRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteWorker_NotFound() {
        when(workerRepository.existsById(1L)).thenReturn(false);

        assertThrows(WorkerNotFoundException.class, () -> workerService.deleteWorker(1L));
    }
}
