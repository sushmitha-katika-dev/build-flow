package com.buildflow.equipment.validator;

import com.buildflow.equipment.dto.request.EquipmentAssignmentRequest;
import com.buildflow.equipment.dto.request.EquipmentCreateRequest;
import com.buildflow.equipment.entity.Equipment;
import org.springframework.stereotype.Component;

@Component
public class EquipmentValidator {

    public void validateEquipmentCreation(EquipmentCreateRequest request) {
        if (!request.isBulk() && request.getTotalQuantity() != 1) {
            throw new IllegalArgumentException("Non-bulk equipment must have a total quantity of 1");
        }
    }

    public void validateEquipmentAssignment(Equipment equipment, EquipmentAssignmentRequest request) {
        if (request.getAssignedQuantity() > equipment.getAvailableQuantity()) {
            throw new IllegalArgumentException("Requested quantity exceeds available quantity");
        }
        
        if (request.getReturnDate() != null && request.getReturnDate().isBefore(request.getAssignmentDate())) {
            throw new IllegalArgumentException("Return date cannot be before assignment date");
        }
    }
}
