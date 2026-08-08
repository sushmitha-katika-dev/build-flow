package com.buildflow.workforce.mapper;

import com.buildflow.workforce.dto.request.AttendanceCreateRequest;
import com.buildflow.workforce.dto.response.AttendanceResponse;
import com.buildflow.workforce.entity.Attendance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AttendanceMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Attendance toEntity(AttendanceCreateRequest request);

    AttendanceResponse toResponse(Attendance attendance);
}
