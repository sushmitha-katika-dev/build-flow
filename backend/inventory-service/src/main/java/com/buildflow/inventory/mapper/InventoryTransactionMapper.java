package com.buildflow.inventory.mapper;

import com.buildflow.inventory.dto.request.InventoryTransactionCreateRequest;
import com.buildflow.inventory.dto.response.InventoryTransactionResponse;
import com.buildflow.inventory.entity.InventoryTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryTransactionMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    InventoryTransaction toEntity(InventoryTransactionCreateRequest request);

    InventoryTransactionResponse toResponse(InventoryTransaction transaction);
}
