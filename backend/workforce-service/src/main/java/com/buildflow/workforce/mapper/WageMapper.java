package com.buildflow.workforce.mapper;

import com.buildflow.workforce.dto.request.WageCreateRequest;
import com.buildflow.workforce.dto.response.WageResponse;
import com.buildflow.workforce.entity.Wage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WageMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Wage toEntity(WageCreateRequest request);

    WageResponse toResponse(Wage wage);
}
