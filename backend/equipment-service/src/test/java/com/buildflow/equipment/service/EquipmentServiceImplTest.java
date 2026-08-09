package com.buildflow.equipment.service;

import com.buildflow.equipment.dto.request.EquipmentCreateRequest;
import com.buildflow.equipment.dto.response.EquipmentResponse;
import com.buildflow.equipment.entity.Equipment;
import com.buildflow.equipment.enums.EquipmentStatus;
import com.buildflow.equipment.enums.EquipmentType;
import com.buildflow.equipment.mapper.EquipmentMapper;
import com.buildflow.equipment.repository.EquipmentRepository;
import com.buildflow.equipment.service.impl.EquipmentServiceImpl;
import com.buildflow.equipment.validator.EquipmentValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EquipmentServiceImplTest {

    @Mock
    private EquipmentRepository equipmentRepository;
    
    @Mock
    private EquipmentMapper equipmentMapper;
    
    @Mock
    private EquipmentValidator equipmentValidator;

    @InjectMocks
    private EquipmentServiceImpl equipmentService;

    private Equipment equipment;
    private EquipmentCreateRequest createRequest;
    private EquipmentResponse response;

    @BeforeEach
    void setUp() {
        equipment = new Equipment();
        equipment.setId(1L);
        equipment.setName("Excavator");
        equipment.setType(EquipmentType.HEAVY_MACHINERY);
        equipment.setStatus(EquipmentStatus.AVAILABLE);
        equipment.setTotalQuantity(1);
        equipment.setAvailableQuantity(1);
        equipment.setBulk(false);

        createRequest = new EquipmentCreateRequest();
        createRequest.setName("Excavator");
        createRequest.setType(EquipmentType.HEAVY_MACHINERY);
        createRequest.setStatus(EquipmentStatus.AVAILABLE);
        createRequest.setTotalQuantity(1);
        createRequest.setBulk(false);

        response = new EquipmentResponse();
        response.setId(1L);
        response.setName("Excavator");
        response.setType(EquipmentType.HEAVY_MACHINERY);
        response.setStatus(EquipmentStatus.AVAILABLE);
        response.setTotalQuantity(1);
        response.setAvailableQuantity(1);
        response.setBulk(false);
    }

    @Test
    void createEquipment_ShouldReturnResponse() {
        doNothing().when(equipmentValidator).validateEquipmentCreation(createRequest);
        when(equipmentMapper.toEntity(createRequest)).thenReturn(equipment);
        when(equipmentRepository.save(any(Equipment.class))).thenReturn(equipment);
        when(equipmentMapper.toResponse(equipment)).thenReturn(response);

        EquipmentResponse result = equipmentService.createEquipment(createRequest);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Excavator", result.getName());
        
        verify(equipmentValidator).validateEquipmentCreation(createRequest);
        verify(equipmentRepository).save(any(Equipment.class));
    }
    
    @Test
    void getEquipmentById_ShouldReturnResponse() {
        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(equipment));
        when(equipmentMapper.toResponse(equipment)).thenReturn(response);
        
        EquipmentResponse result = equipmentService.getEquipmentById(1L);
        
        assertNotNull(result);
        assertEquals(1L, result.getId());
    }
}
