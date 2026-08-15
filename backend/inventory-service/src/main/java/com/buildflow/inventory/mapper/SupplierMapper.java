package com.buildflow.inventory.mapper;

import com.buildflow.inventory.dto.request.SupplierCreateRequest;
import com.buildflow.inventory.dto.response.SupplierResponse;
import com.buildflow.inventory.entity.Supplier;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SupplierMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "phone", source = "phoneNumber")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Supplier toEntity(SupplierCreateRequest request);

    SupplierResponse toResponse(Supplier supplier);
}
