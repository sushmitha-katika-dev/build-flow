package com.buildflow.finance.controller;

import com.buildflow.finance.dto.request.ExpenseRequest;
import com.buildflow.finance.dto.request.ExpenseUpdateRequest;
import com.buildflow.finance.dto.response.ExpenseResponse;
import com.buildflow.finance.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/expenses")
@RequiredArgsConstructor
@Tag(name = "Expense API", description = "API for managing project expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    @Operation(summary = "Record a new expense")
    public ResponseEntity<ExpenseResponse> addExpense(@Valid @RequestBody ExpenseRequest request) {
        return new ResponseEntity<>(expenseService.addExpense(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing expense")
    public ResponseEntity<ExpenseResponse> updateExpense(@PathVariable Long id, @Valid @RequestBody ExpenseUpdateRequest request) {
        return ResponseEntity.ok(expenseService.updateExpense(id, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get expense by ID")
    public ResponseEntity<ExpenseResponse> getExpenseById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get all expenses for a project")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(expenseService.getExpensesByProjectId(projectId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an expense")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
