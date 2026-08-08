package com.buildflow.workforce.repository;

import com.buildflow.workforce.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {
    List<Worker> findByProjectId(Long projectId);
    boolean existsByEmail(String email);
}
