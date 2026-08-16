package com.buildflow.auth.controller;

import com.buildflow.auth.dto.CompanyProfileDto;
import com.buildflow.auth.service.CompanyProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/company")
@RequiredArgsConstructor
@Tag(name = "Company Profile API", description = "Endpoints for managing company identity & profile")
public class CompanyProfileController {

    private final CompanyProfileService service;

    @GetMapping("/profile")
    @Operation(summary = "Get company profile", description = "Retrieves authenticated contractor's company profile")
    public ResponseEntity<CompanyProfileDto.Response> getCompanyProfile() {
        return ResponseEntity.ok(service.getCompanyProfile());
    }

    @PutMapping("/profile")
    @Operation(summary = "Update company profile", description = "Updates authenticated contractor's company profile")
    public ResponseEntity<CompanyProfileDto.Response> updateCompanyProfile(@Valid @RequestBody CompanyProfileDto.Request request) {
        return ResponseEntity.ok(service.updateCompanyProfile(request));
    }
}
