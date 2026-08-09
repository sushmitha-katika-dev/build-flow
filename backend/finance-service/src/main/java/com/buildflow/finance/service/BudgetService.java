package com.buildflow.finance.service;

import com.buildflow.finance.dto.request.BudgetRequest;
import com.buildflow.finance.dto.response.BudgetResponse;

public interface BudgetService {
    BudgetResponse initializeBudget(BudgetRequest request);
    BudgetResponse getBudgetByProjectId(Long projectId);
    BudgetResponse updateBudget(Long projectId, BudgetRequest request);
    void updateActualExpenses(Long projectId);
}
