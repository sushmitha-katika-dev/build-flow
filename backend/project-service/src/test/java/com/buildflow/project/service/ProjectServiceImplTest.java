package com.buildflow.project.service;

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
import com.buildflow.project.service.impl.ProjectServiceImpl;
import com.buildflow.project.validator.ProjectValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceImplTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectMapper projectMapper;

    @Mock
    private ProjectValidator projectValidator;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private ProjectServiceImpl projectService;

    private ProjectCreateRequest createRequest;
    private Project project;
    private ProjectResponse response;

    @BeforeEach
    void setUp() {
        createRequest = new ProjectCreateRequest();
        createRequest.setProjectName("Test Project");
        createRequest.setClientName("Test Client");
        createRequest.setLocation("New York");
        createRequest.setStartDate(LocalDate.now());
        createRequest.setExpectedEndDate(LocalDate.now().plusMonths(6));
        createRequest.setEstimatedBudget(BigDecimal.valueOf(100000));

        project = Project.builder()
                .id(1L)
                .projectCode("PRJ-1234")
                .projectName("Test Project")
                .clientName("Test Client")
                .status(ProjectStatus.PLANNED)
                .build();

        response = new ProjectResponse();
        response.setId(1L);
        response.setProjectCode("PRJ-1234");
        response.setProjectName("Test Project");
    }

    @Test
    void createProject_Success() {
        doNothing().when(projectValidator).validateCreateRequest(any());
        when(projectRepository.existsByProjectCode(anyString())).thenReturn(false);
        when(projectMapper.toEntity(any())).thenReturn(new Project());
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        when(projectMapper.toResponse(any(Project.class))).thenReturn(response);

        ProjectResponse result = projectService.createProject(createRequest);

        assertNotNull(result);
        assertEquals("PRJ-1234", result.getProjectCode());
        verify(kafkaTemplate).send(eq(ProjectConstants.PROJECT_CREATED_TOPIC), any(Project.class));
    }

    @Test
    void createProject_Duplicate_ThrowsException() {
        doNothing().when(projectValidator).validateCreateRequest(any());
        when(projectRepository.existsByProjectCode(anyString())).thenReturn(true);

        assertThrows(DuplicateProjectException.class, () -> projectService.createProject(createRequest));
        verify(projectRepository, never()).save(any());
    }

    @Test
    void getProjectById_Success() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(projectMapper.toResponse(project)).thenReturn(response);

        ProjectResponse result = projectService.getProjectById(1L);

        assertNotNull(result);
        assertEquals("Test Project", result.getProjectName());
    }

    @Test
    void getProjectById_NotFound_ThrowsException() {
        when(projectRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ProjectNotFoundException.class, () -> projectService.getProjectById(1L));
    }
}
