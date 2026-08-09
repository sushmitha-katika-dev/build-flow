package com.buildflow.equipment.service.impl;

import com.buildflow.equipment.constants.EquipmentConstants;
import com.buildflow.equipment.dto.request.MaintenanceRequest;
import com.buildflow.equipment.dto.response.MaintenanceResponse;
import com.buildflow.equipment.entity.Equipment;
import com.buildflow.equipment.entity.MaintenanceRecord;
import com.buildflow.equipment.enums.EquipmentStatus;
import com.buildflow.equipment.enums.MaintenanceStatus;
import com.buildflow.equipment.exception.EquipmentNotFoundException;
import com.buildflow.equipment.mapper.MaintenanceMapper;
import com.buildflow.equipment.repository.EquipmentRepository;
import com.buildflow.equipment.repository.MaintenanceRepository;
import com.buildflow.equipment.service.MaintenanceService;
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
public class MaintenanceServiceImpl implements MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final EquipmentRepository equipmentRepository;
    private final MaintenanceMapper maintenanceMapper;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public MaintenanceResponse scheduleMaintenance(Long equipmentId, MaintenanceRequest request) {
        log.info("Scheduling maintenance for equipment id: {}", equipmentId);
        
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new EquipmentNotFoundException("Equipment not found with id: " + equipmentId));
                
        if (request.getStatus() == MaintenanceStatus.IN_PROGRESS) {
            equipment.setStatus(EquipmentStatus.UNDER_MAINTENANCE);
            equipmentRepository.save(equipment);
        }
        
        MaintenanceRecord record = maintenanceMapper.toEntity(request);
        record.setEquipmentId(equipmentId);
        MaintenanceRecord savedRecord = maintenanceRepository.save(record);
        
        return maintenanceMapper.toResponse(savedRecord);
    }

    @Override
    @Transactional
    public MaintenanceResponse updateMaintenanceStatus(Long maintenanceId, String statusStr) {
        log.info("Updating maintenance status for id: {} to {}", maintenanceId, statusStr);
        
        MaintenanceStatus status = MaintenanceStatus.valueOf(statusStr.toUpperCase());
        
        MaintenanceRecord record = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new IllegalArgumentException("Maintenance record not found with id: " + maintenanceId));
                
        record.setStatus(status);
        MaintenanceRecord savedRecord = maintenanceRepository.save(record);
        
        if (status == MaintenanceStatus.COMPLETED) {
            Equipment equipment = equipmentRepository.findById(record.getEquipmentId())
                    .orElseThrow(() -> new EquipmentNotFoundException("Equipment not found with id: " + record.getEquipmentId()));
                    
            if (equipment.getAvailableQuantity() > 0) {
                equipment.setStatus(EquipmentStatus.AVAILABLE);
            } else {
                equipment.setStatus(EquipmentStatus.IN_USE);
            }
            equipmentRepository.save(equipment);
            
            MaintenanceResponse response = maintenanceMapper.toResponse(savedRecord);
            kafkaTemplate.send(EquipmentConstants.EQUIPMENT_MAINTENANCE_COMPLETED_TOPIC, response);
            return response;
        }
        
        return maintenanceMapper.toResponse(savedRecord);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceResponse> getMaintenanceByEquipmentId(Long equipmentId) {
        return maintenanceRepository.findByEquipmentId(equipmentId).stream()
                .map(maintenanceMapper::toResponse)
                .collect(Collectors.toList());
    }
}
