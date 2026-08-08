package com.buildflow.inventory.repository;

import com.buildflow.inventory.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findByMaterialIdAndProjectId(Long materialId, Long projectId);
    List<Stock> findByProjectId(Long projectId);
    List<Stock> findByMaterialId(Long materialId);
}
