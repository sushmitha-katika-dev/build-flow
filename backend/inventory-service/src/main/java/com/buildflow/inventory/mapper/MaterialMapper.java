package com.buildflow.inventory.mapper;

import com.buildflow.inventory.dto.request.MaterialCreateRequest;
import com.buildflow.inventory.dto.response.MaterialResponse;
import com.buildflow.inventory.entity.Material;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MaterialMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "specifications", source = "description")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Material toEntity(MaterialCreateRequest request);

    MaterialResponse toResponse(Material material);
}
