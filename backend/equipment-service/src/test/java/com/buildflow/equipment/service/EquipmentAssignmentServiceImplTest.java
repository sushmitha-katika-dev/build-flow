package com.buildflow.equipment.service;

import com.buildflow.equipment.dto.request.EquipmentAssignmentRequest;
import com.buildflow.equipment.dto.response.EquipmentAssignmentResponse;
import com.buildflow.equipment.entity.Equipment;
import com.buildflow.equipment.entity.EquipmentAssignment;
import com.buildflow.equipment.enums.EquipmentStatus;
import com.buildflow.equipment.enums.EquipmentType;
import com.buildflow.equipment.mapper.EquipmentAssignmentMapper;
import com.buildflow.equipment.repository.EquipmentAssignmentRepository;
import com.buildflow.equipment.repository.EquipmentRepository;
import com.buildflow.equipment.service.impl.EquipmentAssignmentServiceImpl;
import com.buildflow.equipment.validator.EquipmentValidator;
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
class EquipmentAssignmentServiceImplTest {

    @Mock
    private EquipmentAssignmentRepository assignmentRepository;
    
    @Mock
    private EquipmentRepository equipmentRepository;
    
    @Mock
    private EquipmentAssignmentMapper assignmentMapper;
    
    @Mock
    private EquipmentValidator equipmentValidator;
    
    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private EquipmentAssignmentServiceImpl assignmentService;

    private Equipment equipment;
    private EquipmentAssignmentRequest request;
    private EquipmentAssignment assignment;
    private EquipmentAssignmentResponse response;

    @BeforeEach
    void setUp() {
        equipment = new Equipment();
        equipment.setId(1L);
        equipment.setName("Drill");
        equipment.setType(EquipmentType.POWER_TOOL);
        equipment.setStatus(EquipmentStatus.AVAILABLE);
        equipment.setTotalQuantity(10);
        equipment.setAvailableQuantity(10);
        equipment.setBulk(true);

        request = new EquipmentAssignmentRequest();
        request.setProjectId(100L);
        request.setAssignedQuantity(3);
        request.setAssignmentDate(LocalDate.now());

        assignment = new EquipmentAssignment();
        assignment.setId(1L);
        assignment.setEquipmentId(1L);
        assignment.setProjectId(100L);
        assignment.setAssignedQuantity(3);

        response = new EquipmentAssignmentResponse();
        response.setId(1L);
        response.setEquipmentId(1L);
        response.setProjectId(100L);
        response.setAssignedQuantity(3);
    }

    @Test
    void assignEquipment_ShouldReduceAvailableQuantity() {
        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(equipment));
        doNothing().when(equipmentValidator).validateEquipmentAssignment(equipment, request);
        when(assignmentMapper.toEntity(request)).thenReturn(assignment);
        when(assignmentRepository.save(any(EquipmentAssignment.class))).thenReturn(assignment);
        when(assignmentMapper.toResponse(assignment)).thenReturn(response);

        EquipmentAssignmentResponse result = assignmentService.assignEquipment(1L, request);

        assertNotNull(result);
        assertEquals(7, equipment.getAvailableQuantity());
        verify(equipmentRepository).save(equipment);
        verify(kafkaTemplate).send(anyString(), any());
    }
}
