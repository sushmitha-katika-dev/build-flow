package com.buildflow.equipment.mapper;

import com.buildflow.equipment.dto.request.MaintenanceRequest;
import com.buildflow.equipment.dto.response.MaintenanceResponse;
import com.buildflow.equipment.entity.MaintenanceRecord;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MaintenanceMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "equipmentId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    MaintenanceRecord toEntity(MaintenanceRequest request);

    MaintenanceResponse toResponse(MaintenanceRecord record);
}
