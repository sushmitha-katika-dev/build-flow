package com.buildflow.project.service;

import com.buildflow.project.dto.ProjectRequest;
import com.buildflow.project.dto.ProjectResponse;
import com.buildflow.project.entity.Project;
import com.buildflow.project.enums.ProjectStatus;
import com.buildflow.project.exception.ProjectNotFoundException;
import com.buildflow.project.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProjectServiceImplTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectServiceImpl projectService;

    private Project project;
    private ProjectRequest projectRequest;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id(1L)
                .name("Highrise Alpha")
                .location("New York")
                .status(ProjectStatus.PLANNING)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(6))
                .budget(new BigDecimal("1000000.00"))
                .build();

        projectRequest = new ProjectRequest(
                "Highrise Alpha",
                "New York",
                ProjectStatus.PLANNING,
                LocalDate.now(),
                LocalDate.now().plusMonths(6),
                new BigDecimal("1000000.00")
        );
    }

    @Test
    void createProject_Success() {
        when(projectRepository.save(any(Project.class))).thenReturn(project);

        ProjectResponse response = projectService.createProject(projectRequest);

        assertNotNull(response);
        assertEquals("Highrise Alpha", response.getName());
        assertEquals(ProjectStatus.PLANNING, response.getStatus());
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    void getProjectById_Success() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        ProjectResponse response = projectService.getProjectById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void getProjectById_NotFound() {
        when(projectRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ProjectNotFoundException.class, () -> projectService.getProjectById(1L));
    }

    @Test
    void getAllProjects_Success() {
        when(projectRepository.findAll()).thenReturn(Arrays.asList(project));

        List<ProjectResponse> responses = projectService.getAllProjects();

        assertNotNull(responses);
        assertEquals(1, responses.size());
    }

    @Test
    void updateProject_Success() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenReturn(project);

        ProjectRequest updateRequest = new ProjectRequest(
                "Updated Highrise",
                "New York",
                ProjectStatus.IN_PROGRESS,
                LocalDate.now(),
                LocalDate.now().plusMonths(6),
                new BigDecimal("1500000.00")
        );

        ProjectResponse response = projectService.updateProject(1L, updateRequest);

        assertNotNull(response);
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    void deleteProject_Success() {
        when(projectRepository.existsById(1L)).thenReturn(true);

        projectService.deleteProject(1L);

        verify(projectRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteProject_NotFound() {
        when(projectRepository.existsById(1L)).thenReturn(false);

        assertThrows(ProjectNotFoundException.class, () -> projectService.deleteProject(1L));
    }
}
