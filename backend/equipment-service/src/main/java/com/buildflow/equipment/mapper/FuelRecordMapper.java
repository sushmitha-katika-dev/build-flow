package com.buildflow.equipment.mapper;

import com.buildflow.equipment.dto.request.FuelRecordRequest;
import com.buildflow.equipment.dto.response.FuelRecordResponse;
import com.buildflow.equipment.entity.FuelRecord;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FuelRecordMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "equipmentId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    FuelRecord toEntity(FuelRecordRequest request);

    FuelRecordResponse toResponse(FuelRecord record);
}
