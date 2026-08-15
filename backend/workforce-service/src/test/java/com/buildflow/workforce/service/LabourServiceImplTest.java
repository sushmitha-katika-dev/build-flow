package com.buildflow.workforce.service;

import com.buildflow.workforce.constants.WorkforceConstants;
import com.buildflow.workforce.dto.request.LabourCreateRequest;
import com.buildflow.workforce.dto.response.LabourResponse;
import com.buildflow.workforce.entity.Labour;
import com.buildflow.workforce.enums.LabourRole;
import com.buildflow.workforce.enums.LabourStatus;
import com.buildflow.workforce.exception.ResourceNotFoundException;
import com.buildflow.workforce.mapper.LabourMapper;
import com.buildflow.workforce.repository.LabourRepository;
import com.buildflow.workforce.service.impl.LabourServiceImpl;
import com.buildflow.workforce.validator.LabourValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LabourServiceImplTest {

    @Mock
    private LabourRepository labourRepository;

    @Mock
    private LabourMapper labourMapper;

    @Mock
    private LabourValidator labourValidator;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private LabourServiceImpl labourService;

    private LabourCreateRequest createRequest;
    private Labour labour;
    private LabourResponse response;

    @BeforeEach
    void setUp() {
        createRequest = new LabourCreateRequest();
        createRequest.setFirstName("John");
        createRequest.setLastName("Doe");
        createRequest.setEmail("john.doe@test.com");
        createRequest.setPhoneNumber("1234567890");
        createRequest.setRole(LabourRole.LABORER);
        createRequest.setProjectId(100L);

        labour = new Labour();
        labour.setId(1L);
        labour.setFirstName("John");
        labour.setLastName("Doe");
        labour.setStatus(LabourStatus.ACTIVE);

        response = new LabourResponse();
        response.setId(1L);
        response.setFirstName("John");
        response.setLastName("Doe");
    }

    @Test
    void onboardLabour_Success() {
        doNothing().when(labourValidator).validateCreateRequest(any());
        when(labourMapper.toEntity(any())).thenReturn(labour);
        when(labourRepository.save(any(Labour.class))).thenReturn(labour);
        when(labourMapper.toResponse(any(Labour.class))).thenReturn(response);

        LabourResponse result = labourService.onboardLabour(createRequest);

        assertNotNull(result);
        assertEquals("John", result.getFirstName());
        verify(kafkaTemplate).send(eq(WorkforceConstants.LABOUR_ONBOARDED_TOPIC), any(Labour.class));
    }

    @Test
    void getLabourById_Success() {
        when(labourRepository.findById(1L)).thenReturn(Optional.of(labour));
        when(labourMapper.toResponse(labour)).thenReturn(response);

        LabourResponse result = labourService.getLabourById(1L);

        assertNotNull(result);
        assertEquals("John", result.getFirstName());
    }

    @Test
    void getLabourById_NotFound_ThrowsException() {
        when(labourRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> labourService.getLabourById(1L));
    }
}
