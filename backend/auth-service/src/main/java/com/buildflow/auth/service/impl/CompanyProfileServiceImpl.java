package com.buildflow.auth.service.impl;

import com.buildflow.auth.dto.CompanyProfileDto;
import com.buildflow.auth.entity.CompanyProfile;
import com.buildflow.auth.repository.CompanyProfileRepository;
import com.buildflow.auth.service.CompanyProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyProfileServiceImpl implements CompanyProfileService {

    private final CompanyProfileRepository repository;

    @Override
    public CompanyProfileDto.Response getCompanyProfile() {
        CompanyProfile profile = repository.findById(1L).orElseGet(this::initDefaultCompanyProfile);
        return mapToResponse(profile);
    }

    @Override
    public CompanyProfileDto.Response updateCompanyProfile(CompanyProfileDto.Request request) {
        CompanyProfile profile = repository.findById(1L).orElseGet(this::initDefaultCompanyProfile);

        profile.setCompanyName(request.getCompanyName());
        profile.setBusinessType(request.getBusinessType());
        profile.setDescription(request.getDescription());
        profile.setLocation(request.getLocation());
        profile.setPhone(request.getPhone());
        profile.setEmail(request.getEmail());
        profile.setLogoUrl(request.getLogoUrl());

        CompanyProfile saved = repository.save(profile);
        log.info("Updated Company Profile: {}", saved.getCompanyName());
        return mapToResponse(saved);
    }

    private CompanyProfile initDefaultCompanyProfile() {
        log.info("Initializing default Company Profile");
        CompanyProfile defaultProfile = CompanyProfile.builder()
                .id(1L)
                .companyName("ABC Constructions")
                .businessType("Civil Construction & Contracting")
                .description("Manage your projects, workforce, materials and equipment from one place.")
                .location("Bhongir, Telangana")
                .phone("+91 9876543210")
                .email("company@abcconstructions.com")
                .logoUrl(null)
                .build();
        return repository.save(defaultProfile);
    }

    private CompanyProfileDto.Response mapToResponse(CompanyProfile profile) {
        return CompanyProfileDto.Response.builder()
                .id(profile.getId())
                .companyName(profile.getCompanyName())
                .businessType(profile.getBusinessType())
                .description(profile.getDescription())
                .location(profile.getLocation())
                .phone(profile.getPhone())
                .email(profile.getEmail())
                .logoUrl(profile.getLogoUrl())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
