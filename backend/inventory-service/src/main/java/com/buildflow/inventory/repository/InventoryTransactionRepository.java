package com.buildflow.inventory.repository;

import com.buildflow.inventory.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByMaterialId(Long materialId);
    List<InventoryTransaction> findByProjectId(Long projectId);
}
