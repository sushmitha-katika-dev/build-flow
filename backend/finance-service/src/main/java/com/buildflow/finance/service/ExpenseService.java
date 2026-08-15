package com.buildflow.finance.service;

import com.buildflow.finance.dto.request.ExpenseRequest;
import com.buildflow.finance.dto.request.ExpenseUpdateRequest;
import com.buildflow.finance.dto.response.ExpenseResponse;

import java.util.List;

public interface ExpenseService {
    ExpenseResponse addExpense(ExpenseRequest request);
    ExpenseResponse updateExpense(Long id, ExpenseUpdateRequest request);
    ExpenseResponse getExpenseById(Long id);
    List<ExpenseResponse> getExpensesByProjectId(Long projectId);
    void deleteExpense(Long id);
}
