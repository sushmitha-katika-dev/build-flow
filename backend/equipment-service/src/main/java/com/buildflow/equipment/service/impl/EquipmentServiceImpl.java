package com.buildflow.equipment.service.impl;

import com.buildflow.equipment.dto.request.EquipmentCreateRequest;
import com.buildflow.equipment.dto.request.EquipmentUpdateRequest;
import com.buildflow.equipment.dto.response.EquipmentResponse;
import com.buildflow.equipment.entity.Equipment;
import com.buildflow.equipment.exception.EquipmentNotFoundException;
import com.buildflow.equipment.mapper.EquipmentMapper;
import com.buildflow.equipment.repository.EquipmentRepository;
import com.buildflow.equipment.service.EquipmentService;
import com.buildflow.equipment.validator.EquipmentValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EquipmentServiceImpl implements EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentMapper equipmentMapper;
    private final EquipmentValidator equipmentValidator;

    @Override
    @Transactional
    public EquipmentResponse createEquipment(EquipmentCreateRequest request) {
        log.info("Creating equipment: {}", request.getName());
        equipmentValidator.validateEquipmentCreation(request);
        
        Equipment equipment = equipmentMapper.toEntity(request);
        equipment.setAvailableQuantity(request.getTotalQuantity());
        
        Equipment savedEquipment = equipmentRepository.save(equipment);
        return equipmentMapper.toResponse(savedEquipment);
    }

    @Override
    @Transactional
    public EquipmentResponse updateEquipment(Long id, EquipmentUpdateRequest request) {
        log.info("Updating equipment id: {}", id);
        Equipment equipment = getEquipmentEntity(id);
        
        // Calculate difference in total quantity
        int diff = request.getTotalQuantity() - equipment.getTotalQuantity();
        
        equipmentMapper.updateEntityFromRequest(request, equipment);
        
        // Adjust available quantity based on the change in total quantity
        equipment.setAvailableQuantity(equipment.getAvailableQuantity() + diff);
        
        Equipment updatedEquipment = equipmentRepository.save(equipment);
        return equipmentMapper.toResponse(updatedEquipment);
    }

    @Override
    @Transactional(readOnly = true)
    public EquipmentResponse getEquipmentById(Long id) {
        return equipmentMapper.toResponse(getEquipmentEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentResponse> getAllEquipment() {
        return equipmentRepository.findAll().stream()
                .map(equipmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteEquipment(Long id) {
        log.info("Deleting equipment id: {}", id);
        if (!equipmentRepository.existsById(id)) {
            throw new EquipmentNotFoundException("Equipment not found with id: " + id);
        }
        equipmentRepository.deleteById(id);
    }
    
    private Equipment getEquipmentEntity(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new EquipmentNotFoundException("Equipment not found with id: " + id));
    }
}
