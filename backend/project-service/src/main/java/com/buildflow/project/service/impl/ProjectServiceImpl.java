package com.buildflow.project.service.impl;

import com.buildflow.project.constants.ProjectConstants;
import com.buildflow.project.dto.request.ProjectCreateRequest;
import com.buildflow.project.dto.request.ProjectUpdateRequest;
import com.buildflow.project.dto.response.ProjectResponse;
import com.buildflow.project.entity.Project;
import com.buildflow.project.enums.ProjectStatus;
import com.buildflow.project.exception.DuplicateProjectException;
import com.buildflow.project.exception.ProjectNotFoundException;
import com.buildflow.project.mapper.ProjectMapper;
import com.buildflow.project.repository.ProjectRepository;
import com.buildflow.project.service.ProjectService;
import com.buildflow.project.validator.ProjectValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;
    private final ProjectValidator projectValidator;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public ProjectResponse createProject(ProjectCreateRequest request) {
        log.info("Creating new project: {}", request.getProjectName());
        
        // Validate business rules
        projectValidator.validateCreateRequest(request);

        // Generate project code
        String projectCode = "PRJ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        if (projectRepository.existsByProjectCode(projectCode)) {
            throw new DuplicateProjectException("Project with code " + projectCode + " already exists");
        }

        // Convert DTO to Entity
        Project project = projectMapper.toEntity(request);
        project.setProjectCode(projectCode);
        project.setStatus(ProjectStatus.PLANNED);

        // Save project
        project = projectRepository.save(project);

        // Publish event
        kafkaTemplate.send(ProjectConstants.PROJECT_CREATED_TOPIC, project);

        return projectMapper.toResponse(project);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(ProjectNotFoundException::new);
        return projectMapper.toResponse(project);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(projectMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(Long id, ProjectUpdateRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(ProjectNotFoundException::new);

        projectValidator.validateUpdateRequest(request, project);

        if (request.getProjectName() != null) project.setProjectName(request.getProjectName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getClientName() != null) project.setClientName(request.getClientName());
        if (request.getClientContact() != null) project.setClientContact(request.getClientContact());
        if (request.getLocation() != null) project.setLocation(request.getLocation());
        if (request.getExpectedEndDate() != null) project.setExpectedEndDate(request.getExpectedEndDate());
        if (request.getActualEndDate() != null) project.setActualEndDate(request.getActualEndDate());
        if (request.getEstimatedBudget() != null) project.setEstimatedBudget(request.getEstimatedBudget());

        project = projectRepository.save(project);
        return projectMapper.toResponse(project);
    }

    @Override
    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(ProjectNotFoundException::new);
        projectRepository.delete(project);
    }

    @Override
    @Transactional
    public ProjectResponse updateProjectStatus(Long id, ProjectStatus status) {
        Project project = projectRepository.findById(id)
                .orElseThrow(ProjectNotFoundException::new);

        project.setStatus(status);
        project = projectRepository.save(project);
        
        return projectMapper.toResponse(project);
    }
}
