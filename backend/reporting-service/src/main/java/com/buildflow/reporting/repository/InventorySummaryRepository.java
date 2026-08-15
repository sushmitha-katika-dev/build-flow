package com.buildflow.reporting.repository;

import com.buildflow.reporting.entity.InventorySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventorySummaryRepository extends JpaRepository<InventorySummary, Long> {
}
