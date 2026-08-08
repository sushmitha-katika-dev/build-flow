package com.buildflow.inventory.service;

import com.buildflow.inventory.dto.request.MaterialRequest;
import com.buildflow.inventory.dto.response.MaterialResponse;
import com.buildflow.inventory.entity.Material;
import com.buildflow.inventory.enums.MaterialType;
import com.buildflow.inventory.enums.MaterialUnit;
import com.buildflow.inventory.repository.MaterialRepository;
import com.buildflow.inventory.service.impl.MaterialServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaterialServiceImplTest {

    @Mock
    private MaterialRepository materialRepository;

    @InjectMocks
    private MaterialServiceImpl materialService;

    private Material material;
    private MaterialRequest materialRequest;

    @BeforeEach
    void setUp() {
        material = Material.builder()
                .id(1L)
                .name("Cement 50kg")
                .type(MaterialType.CEMENT)
                .unit(MaterialUnit.BAG)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        materialRequest = new MaterialRequest();
        materialRequest.setName("Cement 50kg");
        materialRequest.setType(MaterialType.CEMENT);
        materialRequest.setUnit(MaterialUnit.BAG);
    }

    @Test
    void createMaterial_Success() {
        when(materialRepository.existsByName("Cement 50kg")).thenReturn(false);
        when(materialRepository.save(any(Material.class))).thenReturn(material);

        MaterialResponse response = materialService.createMaterial(materialRequest);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Cement 50kg", response.getName());
        verify(materialRepository).save(any(Material.class));
    }

    @Test
    void createMaterial_AlreadyExists_ThrowsException() {
        when(materialRepository.existsByName("Cement 50kg")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> materialService.createMaterial(materialRequest));
        verify(materialRepository, never()).save(any(Material.class));
    }

    @Test
    void getMaterialById_Success() {
        when(materialRepository.findById(1L)).thenReturn(Optional.of(material));

        MaterialResponse response = materialService.getMaterialById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }
}
