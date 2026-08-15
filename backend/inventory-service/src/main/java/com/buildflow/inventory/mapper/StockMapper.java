package com.buildflow.inventory.mapper;

import com.buildflow.inventory.dto.request.StockCreateRequest;
import com.buildflow.inventory.dto.response.StockResponse;
import com.buildflow.inventory.entity.Stock;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StockMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "currentStock", source = "quantity")
    @Mapping(target = "reorderLevel", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Stock toEntity(StockCreateRequest request);

    StockResponse toResponse(Stock stock);
}
