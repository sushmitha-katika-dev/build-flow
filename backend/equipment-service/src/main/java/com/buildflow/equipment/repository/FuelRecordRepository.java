package com.buildflow.equipment.repository;

import com.buildflow.equipment.entity.FuelRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FuelRecordRepository extends JpaRepository<FuelRecord, Long> {
    List<FuelRecord> findByEquipmentId(Long equipmentId);
    List<FuelRecord> findByProjectId(Long projectId);
}
