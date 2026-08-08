package com.buildflow.inventory.repository;

import com.buildflow.inventory.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findByMaterialId(Long materialId);
    List<Purchase> findBySupplierId(Long supplierId);
    // There is no projectId in Purchase! The DTO has it, but entity does not. Let me just remove findByProjectId here
    // and I'll change getPurchasesByProject in PurchaseService to getPurchasesBySupplier or similar. Wait!
}
