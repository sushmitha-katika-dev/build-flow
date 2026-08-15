package com.buildflow.workforce.mapper;

import com.buildflow.workforce.dto.request.LabourCreateRequest;
import com.buildflow.workforce.dto.response.LabourResponse;
import com.buildflow.workforce.entity.Labour;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LabourMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Labour toEntity(LabourCreateRequest request);

    LabourResponse toResponse(Labour labour);
}
