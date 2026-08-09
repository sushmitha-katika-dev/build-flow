package com.buildflow.equipment.mapper;

import com.buildflow.equipment.dto.request.EquipmentCreateRequest;
import com.buildflow.equipment.dto.request.EquipmentUpdateRequest;
import com.buildflow.equipment.dto.response.EquipmentResponse;
import com.buildflow.equipment.entity.Equipment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface EquipmentMapper {

    Equipment toEntity(EquipmentCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(EquipmentUpdateRequest request, @MappingTarget Equipment equipment);

    EquipmentResponse toResponse(Equipment equipment);
}
