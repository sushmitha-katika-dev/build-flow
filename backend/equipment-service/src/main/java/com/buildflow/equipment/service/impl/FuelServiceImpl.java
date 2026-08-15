package com.buildflow.equipment.service.impl;

import com.buildflow.equipment.dto.request.FuelRecordRequest;
import com.buildflow.equipment.dto.response.FuelRecordResponse;
import com.buildflow.equipment.entity.FuelRecord;
import com.buildflow.equipment.exception.EquipmentNotFoundException;
import com.buildflow.equipment.mapper.FuelRecordMapper;
import com.buildflow.equipment.repository.EquipmentRepository;
import com.buildflow.equipment.repository.FuelRecordRepository;
import com.buildflow.equipment.service.FuelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FuelServiceImpl implements FuelService {

    private final FuelRecordRepository fuelRecordRepository;
    private final EquipmentRepository equipmentRepository;
    private final FuelRecordMapper fuelRecordMapper;

    @Override
    @Transactional
    public FuelRecordResponse addFuelRecord(Long equipmentId, FuelRecordRequest request) {
        log.info("Adding fuel record for equipment id: {}", equipmentId);
        
        if (!equipmentRepository.existsById(equipmentId)) {
            throw new EquipmentNotFoundException("Equipment not found with id: " + equipmentId);
        }
        
        FuelRecord record = fuelRecordMapper.toEntity(request);
        record.setEquipmentId(equipmentId);
        FuelRecord savedRecord = fuelRecordRepository.save(record);
        
        return fuelRecordMapper.toResponse(savedRecord);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FuelRecordResponse> getFuelRecordsByEquipmentId(Long equipmentId) {
        return fuelRecordRepository.findByEquipmentId(equipmentId).stream()
                .map(fuelRecordMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FuelRecordResponse> getFuelRecordsByProjectId(Long projectId) {
        return fuelRecordRepository.findByProjectId(projectId).stream()
                .map(fuelRecordMapper::toResponse)
                .collect(Collectors.toList());
    }
}
