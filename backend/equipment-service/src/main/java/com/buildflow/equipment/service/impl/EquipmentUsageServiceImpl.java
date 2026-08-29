package com.buildflow.equipment.service.impl;

import com.buildflow.equipment.client.ProjectClient;
import com.buildflow.equipment.dto.event.EquipmentUsageEvent;
import com.buildflow.equipment.dto.request.EquipmentUsageCreateRequest;
import com.buildflow.equipment.dto.response.EquipmentUsageResponse;
import com.buildflow.equipment.entity.Equipment;
import com.buildflow.equipment.entity.EquipmentUsageRecord;
import com.buildflow.equipment.enums.EquipmentStatus;
import com.buildflow.equipment.exception.EquipmentNotFoundException;
import com.buildflow.equipment.repository.EquipmentRepository;
import com.buildflow.equipment.repository.EquipmentUsageRepository;
import com.buildflow.equipment.service.EquipmentUsageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EquipmentUsageServiceImpl implements EquipmentUsageService {

    private final EquipmentUsageRepository usageRepository;
    private final EquipmentRepository equipmentRepository;
    private final ProjectClient projectClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC_EQUIPMENT_USAGE_LOGGED = "equipment-usage-logged";

    @Override
    @Transactional
    public EquipmentUsageResponse recordUsage(EquipmentUsageCreateRequest request) {
        log.info("Recording usage for equipment: {} on project: {}", request.getEquipmentId(), request.getProjectId());

        projectClient.validateProjectIsActive(request.getProjectId());

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new EquipmentNotFoundException("Equipment not found with id: " + request.getEquipmentId()));

        if (equipment.getStatus() == EquipmentStatus.RETIRED) {
            throw new IllegalArgumentException("Cannot record usage for RETIRED equipment.");
        }
        
        if (equipment.getUnitRate() == null) {
            throw new IllegalArgumentException("Equipment unit rate is not configured. Cannot calculate usage cost.");
        }

        BigDecimal appliedUnitRate = equipment.getUnitRate();
        BigDecimal totalCost = request.getUnitsUsed().multiply(appliedUnitRate);

        EquipmentUsageRecord record = EquipmentUsageRecord.builder()
                .equipmentId(request.getEquipmentId())
                .projectId(request.getProjectId())
                .usageDate(request.getUsageDate())
                .unitsUsed(request.getUnitsUsed())
                .appliedUnitRate(appliedUnitRate)
                .totalCost(totalCost)
                .build();

        EquipmentUsageRecord savedRecord = usageRepository.save(record);

        EquipmentUsageEvent event = EquipmentUsageEvent.builder()
                .usageRecordId(savedRecord.getId())
                .equipmentId(savedRecord.getEquipmentId())
                .projectId(savedRecord.getProjectId())
                .usageDate(savedRecord.getUsageDate())
                .unitsUsed(savedRecord.getUnitsUsed())
                .appliedUnitRate(savedRecord.getAppliedUnitRate())
                .totalCost(savedRecord.getTotalCost())
                .timestamp(LocalDateTime.now())
                .build();

        try {
            kafkaTemplate.send(TOPIC_EQUIPMENT_USAGE_LOGGED, event);
        } catch (Exception e) {
            log.error("Failed to send equipment usage logged event", e);
        }

        return mapToResponse(savedRecord);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentUsageResponse> getUsageByEquipmentId(Long equipmentId) {
        return usageRepository.findByEquipmentId(equipmentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentUsageResponse> getUsageByProjectId(Long projectId) {
        return usageRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private EquipmentUsageResponse mapToResponse(EquipmentUsageRecord record) {
        return EquipmentUsageResponse.builder()
                .id(record.getId())
                .equipmentId(record.getEquipmentId())
                .projectId(record.getProjectId())
                .usageDate(record.getUsageDate())
                .unitsUsed(record.getUnitsUsed())
                .appliedUnitRate(record.getAppliedUnitRate())
                .totalCost(record.getTotalCost())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
