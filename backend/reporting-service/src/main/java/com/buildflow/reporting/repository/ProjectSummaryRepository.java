package com.buildflow.reporting.repository;

import com.buildflow.reporting.entity.ProjectSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectSummaryRepository extends JpaRepository<ProjectSummary, Long> {
}
