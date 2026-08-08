package com.buildflow.inventory.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupplierCreateRequest {

    @NotBlank(message = "Supplier name cannot be blank")
    private String name;

    private String contactPerson;

    @Email(message = "Invalid email format")
    private String email;

    private String phoneNumber;

    private String address;

    private String gstNumber;
}
