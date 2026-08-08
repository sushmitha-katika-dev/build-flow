package com.buildflow.project.repository;

import com.buildflow.project.entity.Project;
import com.buildflow.project.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findByProjectCode(String projectCode);

    boolean existsByProjectCode(String projectCode);

    List<Project> findByStatus(ProjectStatus status);
}
