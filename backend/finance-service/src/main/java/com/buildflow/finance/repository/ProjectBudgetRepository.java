package com.buildflow.finance.repository;

import com.buildflow.finance.entity.ProjectBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectBudgetRepository extends JpaRepository<ProjectBudget, Long> {
    Optional<ProjectBudget> findByProjectId(Long projectId);
}
