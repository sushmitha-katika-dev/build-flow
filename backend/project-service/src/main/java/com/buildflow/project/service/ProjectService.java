package com.buildflow.project.service;

import com.buildflow.project.dto.ProjectRequest;
import com.buildflow.project.dto.ProjectResponse;

import java.util.List;

public interface ProjectService {
    ProjectResponse createProject(ProjectRequest request);
    ProjectResponse getProjectById(Long id);
    List<ProjectResponse> getAllProjects();
    ProjectResponse updateProject(Long id, ProjectRequest request);
    void deleteProject(Long id);
}
