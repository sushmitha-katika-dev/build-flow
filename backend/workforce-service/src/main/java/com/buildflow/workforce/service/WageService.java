package com.buildflow.workforce.service;

import com.buildflow.workforce.dto.request.WageRequest;
import com.buildflow.workforce.dto.response.WageResponse;

import java.util.List;

public interface WageService {
    WageResponse recordWage(WageRequest request);
    WageResponse getWageById(Long id);
    List<WageResponse> getWagesByLabourId(Long labourId);
    List<WageResponse> getWagesByProjectId(Long projectId);
    WageResponse updateWage(Long id, WageRequest request);
    void deleteWage(Long id);
}
