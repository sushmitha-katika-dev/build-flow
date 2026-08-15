package com.buildflow.inventory.dto.request;

import lombok.Data;

@Data
public class SupplierUpdateRequest {
    private String name;
    private String contactPerson;
    private String email;
    private String phoneNumber;
    private String address;
    private String gstNumber;
}
