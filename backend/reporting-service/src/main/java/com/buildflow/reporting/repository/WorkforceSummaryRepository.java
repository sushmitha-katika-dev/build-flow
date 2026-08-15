package com.buildflow.reporting.repository;

import com.buildflow.reporting.entity.WorkforceSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkforceSummaryRepository extends JpaRepository<WorkforceSummary, Long> {
}
