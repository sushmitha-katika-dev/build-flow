package com.buildflow.reporting.repository;

import com.buildflow.reporting.entity.FinancialSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FinancialSummaryRepository extends JpaRepository<FinancialSummary, Long> {
}
