package com.buildflow.inventory.mapper;

import com.buildflow.inventory.dto.request.PurchaseCreateRequest;
import com.buildflow.inventory.dto.response.PurchaseResponse;
import com.buildflow.inventory.entity.Purchase;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PurchaseMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "purchaseDate", source = "orderDate")
    @Mapping(target = "totalAmount", source = "totalCost")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Purchase toEntity(PurchaseCreateRequest request);

    PurchaseResponse toResponse(Purchase purchase);
}
