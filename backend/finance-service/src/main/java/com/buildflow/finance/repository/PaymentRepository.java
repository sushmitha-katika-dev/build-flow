package com.buildflow.finance.repository;

import com.buildflow.finance.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByProjectId(Long projectId);
    
    Optional<Payment> findByReferenceId(String referenceId);
}
