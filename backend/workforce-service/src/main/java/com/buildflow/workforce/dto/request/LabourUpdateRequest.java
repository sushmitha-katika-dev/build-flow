package com.buildflow.workforce.dto.request;

import com.buildflow.workforce.enums.LabourRole;
import com.buildflow.workforce.enums.LabourStatus;
import lombok.Data;

@Data
public class LabourUpdateRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private LabourRole role;
    private Long projectId;
    private LabourStatus status;
}
