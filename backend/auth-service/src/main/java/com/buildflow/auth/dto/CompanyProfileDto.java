package com.buildflow.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class CompanyProfileDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Company name is required")
        private String companyName;

        private String businessType;
        private String description;
        private String location;
        private String phone;

        @Email(message = "Invalid email format")
        private String email;

        private String logoUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String companyName;
        private String businessType;
        private String description;
        private String location;
        private String phone;
        private String email;
        private String logoUrl;
        private LocalDateTime updatedAt;
    }
}
