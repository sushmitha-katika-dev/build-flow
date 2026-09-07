package com.buildflow.workforce.repository;

import com.buildflow.workforce.entity.FixedWorkAgreement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FixedWorkAgreementRepository extends JpaRepository<FixedWorkAgreement, Long> {
    List<FixedWorkAgreement> findByLabourId(Long labourId);
    List<FixedWorkAgreement> findByProjectId(Long projectId);
    List<FixedWorkAgreement> findByLabourIdAndProjectId(Long labourId, Long projectId);
}
