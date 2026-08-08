package com.buildflow.workforce.service;

import com.buildflow.workforce.dto.request.LabourRequest;
import com.buildflow.workforce.dto.response.LabourResponse;

import java.util.List;

public interface LabourService {
    LabourResponse createLabour(LabourRequest request);
    LabourResponse getLabourById(Long id);
    List<LabourResponse> getAllLabours();
    List<LabourResponse> getLaboursByProjectId(Long projectId);
    LabourResponse updateLabour(Long id, LabourRequest request);
    void deleteLabour(Long id);
}
