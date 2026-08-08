package com.buildflow.workforce.service;

import com.buildflow.workforce.dto.request.WageCreateRequest;
import com.buildflow.workforce.dto.request.WageUpdateRequest;
import com.buildflow.workforce.dto.response.WageResponse;

import java.util.List;

public interface WageService {
    WageResponse recordWage(WageCreateRequest request);
    WageResponse getWageById(Long id);
    List<WageResponse> getWagesByLabourId(Long labourId);
    List<WageResponse> getWagesByProjectId(Long projectId);
    WageResponse updateWage(Long id, WageUpdateRequest request);
}
