package com.buildflow.inventory.service;

import com.buildflow.inventory.constants.InventoryConstants;
import com.buildflow.inventory.dto.request.MaterialCreateRequest;
import com.buildflow.inventory.dto.response.MaterialResponse;
import com.buildflow.inventory.entity.Material;
import com.buildflow.inventory.enums.MaterialType;
import com.buildflow.inventory.enums.MaterialUnit;
import com.buildflow.inventory.mapper.MaterialMapper;
import com.buildflow.inventory.repository.MaterialRepository;
import com.buildflow.inventory.service.impl.MaterialServiceImpl;
import com.buildflow.inventory.validator.MaterialValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaterialServiceImplTest {

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private MaterialMapper materialMapper;

    @Mock
    private MaterialValidator materialValidator;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private MaterialServiceImpl materialService;

    private MaterialCreateRequest request;
    private Material material;
    private MaterialResponse response;

    @BeforeEach
    void setUp() {
        request = new MaterialCreateRequest();
        request.setName("Cement");
        request.setType(MaterialType.CEMENT);
        request.setUnit(MaterialUnit.BAG);
        request.setUnitPrice(BigDecimal.valueOf(350));
        request.setReorderLevel(BigDecimal.valueOf(100));

        material = new Material();
        material.setId(1L);
        material.setName("Cement");
        material.setType(MaterialType.CEMENT);

        response = new MaterialResponse();
        response.setId(1L);
        response.setName("Cement");
        response.setType(MaterialType.CEMENT);
    }

    @Test
    void createMaterial_Success() {
        doNothing().when(materialValidator).validateCreateRequest(any());
        when(materialMapper.toEntity(any())).thenReturn(material);
        when(materialRepository.save(any(Material.class))).thenReturn(material);
        when(materialMapper.toResponse(any(Material.class))).thenReturn(response);

        MaterialResponse result = materialService.createMaterial(request);

        assertNotNull(result);
        assertEquals("Cement", result.getName());
        verify(kafkaTemplate).send(eq(InventoryConstants.MATERIAL_CREATED_TOPIC), any(Material.class));
    }

    @Test
    void getMaterialById_Success() {
        when(materialRepository.findById(1L)).thenReturn(Optional.of(material));
        when(materialMapper.toResponse(material)).thenReturn(response);

        MaterialResponse result = materialService.getMaterialById(1L);

        assertNotNull(result);
        assertEquals("Cement", result.getName());
    }
}
