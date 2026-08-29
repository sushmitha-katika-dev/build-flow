package com.buildflow.equipment.service.impl;

import com.buildflow.equipment.client.ProjectClient;
import com.buildflow.equipment.constants.EquipmentConstants;
import com.buildflow.equipment.dto.request.EquipmentAssignmentRequest;
import com.buildflow.equipment.dto.response.EquipmentAssignmentResponse;
import com.buildflow.equipment.entity.Equipment;
import com.buildflow.equipment.entity.EquipmentAssignment;
import com.buildflow.equipment.enums.EquipmentStatus;
import com.buildflow.equipment.exception.EquipmentNotFoundException;
import com.buildflow.equipment.mapper.EquipmentAssignmentMapper;
import com.buildflow.equipment.repository.EquipmentAssignmentRepository;
import com.buildflow.equipment.repository.EquipmentRepository;
import com.buildflow.equipment.service.EquipmentAssignmentService;
import com.buildflow.equipment.validator.EquipmentValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EquipmentAssignmentServiceImpl implements EquipmentAssignmentService {

    private final EquipmentAssignmentRepository assignmentRepository;
    private final EquipmentRepository equipmentRepository;
    private final EquipmentAssignmentMapper assignmentMapper;
    private final EquipmentValidator equipmentValidator;
    private final ProjectClient projectClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public EquipmentAssignmentResponse assignEquipment(Long equipmentId, EquipmentAssignmentRequest request) {
        log.info("Assigning equipment id: {} to project id: {}", equipmentId, request.getProjectId());
        
        projectClient.validateProjectIsActive(request.getProjectId());

        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new EquipmentNotFoundException("Equipment not found with id: " + equipmentId));
                
        equipmentValidator.validateEquipmentAssignment(equipment, request);
        
        equipment.setAvailableQuantity(equipment.getAvailableQuantity() - request.getAssignedQuantity());
        
        if (equipment.getAvailableQuantity() == 0 && equipment.getStatus() == EquipmentStatus.AVAILABLE) {
            equipment.setStatus(EquipmentStatus.IN_USE);
        }
        equipmentRepository.save(equipment);
        
        EquipmentAssignment assignment = assignmentMapper.toEntity(request);
        assignment.setEquipmentId(equipmentId);
        EquipmentAssignment savedAssignment = assignmentRepository.save(assignment);
        
        EquipmentAssignmentResponse response = assignmentMapper.toResponse(savedAssignment);
        
        try {
            kafkaTemplate.send(EquipmentConstants.EQUIPMENT_ASSIGNED_TOPIC, response);
        } catch (Exception e) {
            log.error("Failed to send equipment assigned event", e);
        }
        
        return response;
    }

    @Override
    @Transactional
    public EquipmentAssignmentResponse returnEquipment(Long assignmentId) {
        log.info("Returning equipment for assignment id: {}", assignmentId);
        
        EquipmentAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found with id: " + assignmentId));
                
        if (assignment.getReturnDate() != null) {
            throw new IllegalArgumentException("Equipment already returned for this assignment");
        }
        
        assignment.setReturnDate(LocalDate.now());
        
        Equipment equipment = equipmentRepository.findById(assignment.getEquipmentId())
                .orElseThrow(() -> new EquipmentNotFoundException("Equipment not found with id: " + assignment.getEquipmentId()));
                
        equipment.setAvailableQuantity(equipment.getAvailableQuantity() + assignment.getAssignedQuantity());
        if (equipment.getStatus() == EquipmentStatus.IN_USE && equipment.getAvailableQuantity() > 0) {
            equipment.setStatus(EquipmentStatus.AVAILABLE);
        }
        
        equipmentRepository.save(equipment);
        EquipmentAssignment savedAssignment = assignmentRepository.save(assignment);
        
        return assignmentMapper.toResponse(savedAssignment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentAssignmentResponse> getAssignmentsByEquipmentId(Long equipmentId) {
        return assignmentRepository.findByEquipmentId(equipmentId).stream()
                .map(assignmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentAssignmentResponse> getAssignmentsByProjectId(Long projectId) {
        return assignmentRepository.findByProjectId(projectId).stream()
                .map(assignmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void closeActiveAssignmentsForProject(Long projectId) {
        if (projectId == null) return;
        log.info("Closing all active equipment assignments for project ID: {}", projectId);

        List<EquipmentAssignment> activeAssignments = assignmentRepository.findByProjectId(projectId).stream()
                .filter(a -> a.getReturnDate() == null)
                .collect(Collectors.toList());

        for (EquipmentAssignment assignment : activeAssignments) {
            assignment.setReturnDate(LocalDate.now());
            assignmentRepository.save(assignment);

            Equipment equipment = equipmentRepository.findById(assignment.getEquipmentId()).orElse(null);
            if (equipment != null) {
                equipment.setAvailableQuantity(equipment.getAvailableQuantity() + assignment.getAssignedQuantity());
                if (equipment.getStatus() == EquipmentStatus.IN_USE && equipment.getAvailableQuantity() > 0) {
                    equipment.setStatus(EquipmentStatus.AVAILABLE);
                }
                equipmentRepository.save(equipment);
                log.info("Returned equipment ID: {} from closed project ID: {}", equipment.getId(), projectId);
            }
        }
    }
}
