package com.buildflow.project.service;

import com.buildflow.project.dto.request.ProjectCreateRequest;
import com.buildflow.project.dto.request.ProjectUpdateRequest;
import com.buildflow.project.dto.response.ProjectResponse;
import com.buildflow.project.enums.ProjectStatus;

import java.util.List;

public interface ProjectService {

    ProjectResponse createProject(ProjectCreateRequest request);

    ProjectResponse getProjectById(Long id);

    List<ProjectResponse> getAllProjects();

    ProjectResponse updateProject(Long id, ProjectUpdateRequest request);

    void deleteProject(Long id);

    ProjectResponse updateProjectStatus(Long id, ProjectStatus status);
}
