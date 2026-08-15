package com.buildflow.project.mapper;

import com.buildflow.project.dto.request.ProjectCreateRequest;
import com.buildflow.project.dto.response.ProjectResponse;
import com.buildflow.project.entity.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "projectCode", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "actualEndDate", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Project toEntity(ProjectCreateRequest request);

    ProjectResponse toResponse(Project project);
}
