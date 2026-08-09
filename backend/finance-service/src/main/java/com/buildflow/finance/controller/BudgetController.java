package com.buildflow.finance.controller;

import com.buildflow.finance.dto.request.BudgetRequest;
import com.buildflow.finance.dto.response.BudgetResponse;
import com.buildflow.finance.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
@Tag(name = "Budget API", description = "API for tracking project budgets")
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    @Operation(summary = "Initialize a budget for a project")
    public ResponseEntity<BudgetResponse> initializeBudget(@Valid @RequestBody BudgetRequest request) {
        return new ResponseEntity<>(budgetService.initializeBudget(request), HttpStatus.CREATED);
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get project budget")
    public ResponseEntity<BudgetResponse> getBudgetByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(budgetService.getBudgetByProjectId(projectId));
    }

    @PutMapping("/project/{projectId}")
    @Operation(summary = "Update estimated budget for a project")
    public ResponseEntity<BudgetResponse> updateBudget(@PathVariable Long projectId, @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.updateBudget(projectId, request));
    }
}
