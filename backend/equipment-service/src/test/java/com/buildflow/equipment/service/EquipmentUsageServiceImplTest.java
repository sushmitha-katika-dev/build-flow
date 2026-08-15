package com.buildflow.equipment.service;

import com.buildflow.equipment.dto.request.EquipmentUsageCreateRequest;
import com.buildflow.equipment.dto.response.EquipmentUsageResponse;
import com.buildflow.equipment.entity.Equipment;
import com.buildflow.equipment.entity.EquipmentUsageRecord;
import com.buildflow.equipment.enums.EquipmentStatus;
import com.buildflow.equipment.enums.OwnershipType;
import com.buildflow.equipment.enums.UsageUnit;
import com.buildflow.equipment.repository.EquipmentRepository;
import com.buildflow.equipment.repository.EquipmentUsageRepository;
import com.buildflow.equipment.service.impl.EquipmentUsageServiceImpl;
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
public class EquipmentUsageServiceImplTest {

    @Mock
    private EquipmentUsageRepository usageRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private EquipmentUsageServiceImpl equipmentUsageService;

    private Equipment equipment;
    private EquipmentUsageCreateRequest request;

    @BeforeEach
    void setUp() {
        equipment = Equipment.builder()
                .id(1L)
                .name("Tractor")
                .status(EquipmentStatus.AVAILABLE)
                .ownershipType(OwnershipType.OWNED)
                .usageUnit(UsageUnit.HOURLY)
                .unitRate(new BigDecimal("500.00"))
                .build();

        request = EquipmentUsageCreateRequest.builder()
                .equipmentId(1L)
                .projectId(10L)
                .usageDate(LocalDate.of(2026, 8, 15))
                .unitsUsed(new BigDecimal("8"))
                .build();
    }

    @Test
    void recordUsage_Success_CalculatesCorrectCost() {
        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(equipment));
        when(usageRepository.save(any(EquipmentUsageRecord.class))).thenAnswer(i -> {
            EquipmentUsageRecord record = i.getArgument(0);
            record.setId(100L);
            return record;
        });

        EquipmentUsageResponse response = equipmentUsageService.recordUsage(request);

        assertNotNull(response);
        assertEquals(new BigDecimal("4000.00"), response.getTotalCost());
        assertEquals(new BigDecimal("500.00"), response.getAppliedUnitRate());
        assertEquals(new BigDecimal("8"), response.getUnitsUsed());
        
        verify(kafkaTemplate).send(eq("equipment-usage-logged"), any());
    }

    @Test
    void recordUsage_RetiredEquipment_ThrowsException() {
        equipment.setStatus(EquipmentStatus.RETIRED);
        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(equipment));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            equipmentUsageService.recordUsage(request);
        });
        assertTrue(exception.getMessage().contains("Cannot record usage for RETIRED equipment."));
    }

    @Test
    void recordUsage_NoUnitRate_ThrowsException() {
        equipment.setUnitRate(null);
        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(equipment));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            equipmentUsageService.recordUsage(request);
        });
        assertTrue(exception.getMessage().contains("Equipment unit rate is not configured."));
    }
}
