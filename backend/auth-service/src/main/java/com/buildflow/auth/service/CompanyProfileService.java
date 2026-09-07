package com.buildflow.auth.service;

import com.buildflow.auth.dto.CompanyProfileDto;

public interface CompanyProfileService {
    CompanyProfileDto.Response getCompanyProfile();
    CompanyProfileDto.Response updateCompanyProfile(CompanyProfileDto.Request request);
}
