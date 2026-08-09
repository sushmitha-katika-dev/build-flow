package com.buildflow.equipment.mapper;

import com.buildflow.equipment.dto.request.EquipmentAssignmentRequest;
import com.buildflow.equipment.dto.response.EquipmentAssignmentResponse;
import com.buildflow.equipment.entity.EquipmentAssignment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EquipmentAssignmentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "equipmentId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    EquipmentAssignment toEntity(EquipmentAssignmentRequest request);

    EquipmentAssignmentResponse toResponse(EquipmentAssignment assignment);
}
