package com.buildflow.workforce.service;

import com.buildflow.workforce.constants.WorkforceConstants;
import com.buildflow.workforce.dto.request.WageCreateRequest;
import com.buildflow.workforce.dto.response.WageResponse;
import com.buildflow.workforce.entity.Wage;
import com.buildflow.workforce.exception.ResourceNotFoundException;
import com.buildflow.workforce.mapper.WageMapper;
import com.buildflow.workforce.repository.LabourRepository;
import com.buildflow.workforce.repository.WageRepository;
import com.buildflow.workforce.service.impl.WageServiceImpl;
import com.buildflow.workforce.validator.WageValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WageServiceImplTest {

    @Mock
    private WageRepository wageRepository;

    @Mock
    private LabourRepository labourRepository;

    @Mock
    private WageMapper wageMapper;

    @Mock
    private WageValidator wageValidator;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private WageServiceImpl wageService;

    private WageCreateRequest createRequest;
    private Wage wage;
    private WageResponse response;

    @BeforeEach
    void setUp() {
        createRequest = new WageCreateRequest();
        createRequest.setLabourId(1L);
        createRequest.setProjectId(100L);
        createRequest.setHourlyRate(BigDecimal.valueOf(20));
        createRequest.setTotalHours(BigDecimal.valueOf(8));
        createRequest.setAmountPaid(BigDecimal.valueOf(160));
        createRequest.setPaymentDate(LocalDate.now());

        wage = new Wage();
        wage.setId(1L);
        wage.setLabourId(1L);
        wage.setAmountPaid(BigDecimal.valueOf(160));

        response = new WageResponse();
        response.setId(1L);
        response.setLabourId(1L);
        response.setAmountPaid(BigDecimal.valueOf(160));
    }

    @Test
    void recordWage_Success() {
        when(labourRepository.existsById(1L)).thenReturn(true);
        doNothing().when(wageValidator).validateCreateRequest(any());
        when(wageMapper.toEntity(any())).thenReturn(wage);
        when(wageRepository.save(any(Wage.class))).thenReturn(wage);
        when(wageMapper.toResponse(any(Wage.class))).thenReturn(response);

        WageResponse result = wageService.recordWage(createRequest);

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(160), result.getAmountPaid());
        verify(kafkaTemplate).send(eq(WorkforceConstants.WAGE_PROCESSED_TOPIC), any(Wage.class));
    }

    @Test
    void recordWage_LabourNotFound_ThrowsException() {
        when(labourRepository.existsById(1L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> wageService.recordWage(createRequest));
        verify(wageRepository, never()).save(any());
    }

    @Test
    void getWageById_Success() {
        when(wageRepository.findById(1L)).thenReturn(Optional.of(wage));
        when(wageMapper.toResponse(wage)).thenReturn(response);

        WageResponse result = wageService.getWageById(1L);

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(160), result.getAmountPaid());
    }
}
