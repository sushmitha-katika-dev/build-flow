package com.buildflow.workforce.repository;

import com.buildflow.workforce.entity.Labour;
import com.buildflow.workforce.enums.LabourStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabourRepository extends JpaRepository<Labour, Long> {
    List<Labour> findByStatus(LabourStatus status);
    List<Labour> findByProjectId(Long projectId);
}
