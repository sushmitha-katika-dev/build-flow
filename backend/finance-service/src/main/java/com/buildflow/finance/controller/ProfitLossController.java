package com.buildflow.finance.controller;

import com.buildflow.finance.dto.response.ProfitLossResponse;
import com.buildflow.finance.service.ProfitLossService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profit-loss")
@RequiredArgsConstructor
@Tag(name = "Profit & Loss API", description = "API for calculating project profitability")
public class ProfitLossController {

    private final ProfitLossService profitLossService;

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Calculate Profit or Loss for a project")
    public ResponseEntity<ProfitLossResponse> calculateProfitLoss(@PathVariable Long projectId) {
        return ResponseEntity.ok(profitLossService.calculateProfitLoss(projectId));
    }
}
