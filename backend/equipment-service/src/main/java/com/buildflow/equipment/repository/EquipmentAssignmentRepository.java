package com.buildflow.equipment.repository;

import com.buildflow.equipment.entity.EquipmentAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentAssignmentRepository extends JpaRepository<EquipmentAssignment, Long> {
    List<EquipmentAssignment> findByEquipmentId(Long equipmentId);
    List<EquipmentAssignment> findByProjectId(Long projectId);
    List<EquipmentAssignment> findByEquipmentIdAndProjectIdAndReturnDateIsNull(Long equipmentId, Long projectId);
}
