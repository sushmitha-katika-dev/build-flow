package com.buildflow.equipment.repository;

import com.buildflow.equipment.entity.EquipmentUsageRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentUsageRepository extends JpaRepository<EquipmentUsageRecord, Long> {
    List<EquipmentUsageRecord> findByEquipmentId(Long equipmentId);
    List<EquipmentUsageRecord> findByProjectId(Long projectId);
}
