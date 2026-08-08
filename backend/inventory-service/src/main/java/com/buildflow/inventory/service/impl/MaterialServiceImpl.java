package com.buildflow.inventory.service.impl;

import com.buildflow.inventory.dto.request.MaterialRequest;
import com.buildflow.inventory.dto.response.MaterialResponse;
import com.buildflow.inventory.entity.Material;
import com.buildflow.inventory.exception.ResourceNotFoundException;
import com.buildflow.inventory.repository.MaterialRepository;
import com.buildflow.inventory.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;

    @Override
    public MaterialResponse createMaterial(MaterialRequest request) {
        if (materialRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Material with name " + request.getName() + " already exists");
        }

        Material material = Material.builder()
                .name(request.getName())
                .type(request.getType())
                .unit(request.getUnit())
                .specifications(request.getSpecifications())
                .build();

        return mapToResponse(materialRepository.save(material));
    }

    @Override
    public MaterialResponse getMaterialById(Long id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));
        return mapToResponse(material);
    }

    @Override
    public List<MaterialResponse> getAllMaterials() {
        return materialRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MaterialResponse updateMaterial(Long id, MaterialRequest request) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));

        material.setName(request.getName());
        material.setType(request.getType());
        material.setUnit(request.getUnit());
        material.setSpecifications(request.getSpecifications());

        return mapToResponse(materialRepository.save(material));
    }

    @Override
    public void deleteMaterial(Long id) {
        if (!materialRepository.existsById(id)) {
            throw new ResourceNotFoundException("Material not found with id: " + id);
        }
        materialRepository.deleteById(id);
    }

    private MaterialResponse mapToResponse(Material material) {
        return MaterialResponse.builder()
                .id(material.getId())
                .name(material.getName())
                .type(material.getType())
                .unit(material.getUnit())
                .specifications(material.getSpecifications())
                .createdAt(material.getCreatedAt())
                .updatedAt(material.getUpdatedAt())
                .build();
    }
}
