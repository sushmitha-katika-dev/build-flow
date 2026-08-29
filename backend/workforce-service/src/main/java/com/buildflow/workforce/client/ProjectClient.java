package com.buildflow.workforce.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@Slf4j
public class ProjectClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${PROJECT_SERVICE_URL:http://project-service:8082}")
    private String projectServiceUrl;

    public void validateProjectIsActive(Long projectId) {
        if (projectId == null || projectId == 0) {
            return;
        }

        try {
            String url = projectServiceUrl + "/api/v1/projects/" + projectId;
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("status")) {
                String status = String.valueOf(response.get("status"));
                if ("COMPLETED".equalsIgnoreCase(status) || "CANCELLED".equalsIgnoreCase(status)) {
                    throw new IllegalArgumentException("Operation rejected: Project #" + projectId + " is " + status + ".");
                } else if ("PLANNED".equalsIgnoreCase(status) || "ON_HOLD".equalsIgnoreCase(status)) {
                    try {
                        String updateUrl = projectServiceUrl + "/api/v1/projects/" + projectId + "/status?status=ACTIVE";
                        restTemplate.patchForObject(updateUrl, null, Map.class);
                        log.info("Automatically transitioned project #{} to ACTIVE upon workforce assignment.", projectId);
                    } catch (Exception ex) {
                        log.warn("Could not auto-activate project #{}: {}", projectId, ex.getMessage());
                    }
                }
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Could not verify status with project-service for project ID: {}. Error: {}", projectId, e.getMessage());
        }
    }
}
