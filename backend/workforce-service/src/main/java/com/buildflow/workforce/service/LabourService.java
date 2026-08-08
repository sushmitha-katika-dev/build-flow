package com.buildflow.workforce.service;

import com.buildflow.workforce.dto.request.LabourCreateRequest;
import com.buildflow.workforce.dto.request.LabourUpdateRequest;
import com.buildflow.workforce.dto.response.LabourResponse;
import com.buildflow.workforce.enums.LabourStatus;

import java.util.List;

public interface LabourService {
    LabourResponse onboardLabour(LabourCreateRequest request);
    LabourResponse getLabourById(Long id);
    List<LabourResponse> getAllLabour();
    List<LabourResponse> getLabourByProject(Long projectId);
    LabourResponse updateLabour(Long id, LabourUpdateRequest request);
    LabourResponse updateLabourStatus(Long id, LabourStatus status);
}
