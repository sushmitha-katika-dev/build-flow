package com.buildflow.inventory.service.impl;

import com.buildflow.inventory.constants.InventoryConstants;
import com.buildflow.inventory.dto.request.MaterialCreateRequest;
import com.buildflow.inventory.dto.request.MaterialUpdateRequest;
import com.buildflow.inventory.dto.response.MaterialResponse;
import com.buildflow.inventory.entity.Material;
import com.buildflow.inventory.exception.ResourceNotFoundException;
import com.buildflow.inventory.mapper.MaterialMapper;
import com.buildflow.inventory.repository.MaterialRepository;
import com.buildflow.inventory.service.MaterialService;
import com.buildflow.inventory.validator.MaterialValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;
    private final MaterialMapper materialMapper;
    private final MaterialValidator materialValidator;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public MaterialResponse createMaterial(MaterialCreateRequest request) {
        log.info("Creating new material: {}", request.getName());

        materialValidator.validateCreateRequest(request);

        Material material = materialMapper.toEntity(request);
        material = materialRepository.save(material);

        kafkaTemplate.send(InventoryConstants.MATERIAL_CREATED_TOPIC, material);

        return materialMapper.toResponse(material);
    }

    @Override
    @Transactional(readOnly = true)
    public MaterialResponse getMaterialById(Long id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));
        return materialMapper.toResponse(material);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialResponse> getAllMaterials() {
        return materialRepository.findAll().stream()
                .map(materialMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MaterialResponse updateMaterial(Long id, MaterialUpdateRequest request) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));

        materialValidator.validateUpdateRequest(request, material);

        if (request.getName() != null) material.setName(request.getName());
        if (request.getDescription() != null) material.setSpecifications(request.getDescription());
        if (request.getType() != null) material.setType(request.getType());
        if (request.getUnit() != null) material.setUnit(request.getUnit());

        material = materialRepository.save(material);
        return materialMapper.toResponse(material);
    }
}
