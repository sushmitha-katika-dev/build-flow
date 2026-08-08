package com.buildflow.workforce.service;

import com.buildflow.workforce.dto.request.WageRequest;
import com.buildflow.workforce.dto.response.WageResponse;
import com.buildflow.workforce.entity.Wage;
import com.buildflow.workforce.exception.ResourceNotFoundException;
import com.buildflow.workforce.repository.LabourRepository;
import com.buildflow.workforce.repository.WageRepository;
import com.buildflow.workforce.service.impl.WageServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WageServiceImplTest {

    @Mock
    private WageRepository wageRepository;

    @Mock
    private LabourRepository labourRepository;

    @InjectMocks
    private WageServiceImpl wageService;

    private Wage wage;
    private WageRequest wageRequest;

    @BeforeEach
    void setUp() {
        wage = Wage.builder()
                .id(1L)
                .labourId(1L)
                .projectId(10L)
                .hourlyRate(new BigDecimal("50.00"))
                .totalHours(new BigDecimal("40.00"))
                .amountPaid(new BigDecimal("2000.00"))
                .paymentDate(LocalDate.now())
                .build();

        wageRequest = new WageRequest(
                1L,
                10L,
                new BigDecimal("50.00"),
                new BigDecimal("40.00"),
                new BigDecimal("2000.00"),
                LocalDate.now()
        );
    }

    @Test
    void recordWage_Success() {
        when(labourRepository.existsById(1L)).thenReturn(true);
        when(wageRepository.save(any(Wage.class))).thenReturn(wage);

        WageResponse response = wageService.recordWage(wageRequest);

        assertNotNull(response);
        assertEquals(1L, response.getLabourId());
        verify(wageRepository, times(1)).save(any(Wage.class));
    }

    @Test
    void recordWage_LabourNotFound() {
        when(labourRepository.existsById(1L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> wageService.recordWage(wageRequest));
        verify(wageRepository, never()).save(any(Wage.class));
    }

    @Test
    void getWageById_Success() {
        when(wageRepository.findById(1L)).thenReturn(Optional.of(wage));

        WageResponse response = wageService.getWageById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void getWagesByLabourId_Success() {
        when(wageRepository.findByLabourId(1L)).thenReturn(Arrays.asList(wage));

        List<WageResponse> responses = wageService.getWagesByLabourId(1L);

        assertNotNull(responses);
        assertEquals(1, responses.size());
    }
}
