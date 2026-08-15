package com.buildflow.workforce.repository;

import com.buildflow.workforce.entity.Wage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WageRepository extends JpaRepository<Wage, Long> {
    List<Wage> findByLabourId(Long labourId);
    List<Wage> findByProjectId(Long projectId);
}
