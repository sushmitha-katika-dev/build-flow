package com.buildflow.workforce.service;

import com.buildflow.workforce.dto.request.FixedWorkAgreementCreateRequest;
import com.buildflow.workforce.dto.request.FixedWorkAgreementUpdateRequest;
import com.buildflow.workforce.dto.response.FixedWorkAgreementResponse;

import java.util.List;

public interface FixedWorkAgreementService {
    FixedWorkAgreementResponse createAgreement(FixedWorkAgreementCreateRequest request);
    FixedWorkAgreementResponse getAgreementById(Long id);
    List<FixedWorkAgreementResponse> getAgreementsByLabour(Long labourId);
    List<FixedWorkAgreementResponse> getAgreementsByProject(Long projectId);
    List<FixedWorkAgreementResponse> getAgreementsByLabourAndProject(Long labourId, Long projectId);
    FixedWorkAgreementResponse updateAgreement(Long id, FixedWorkAgreementUpdateRequest request);
    FixedWorkAgreementResponse updateAgreementStatus(Long id, com.buildflow.workforce.enums.FixedWorkStatus status);
}
