package com.buildflow.finance.service.impl;

import com.buildflow.finance.dto.request.BudgetRequest;
import com.buildflow.finance.dto.response.BudgetResponse;
import com.buildflow.finance.entity.Expense;
import com.buildflow.finance.entity.ProjectBudget;
import com.buildflow.finance.exception.InvalidBudgetException;
import com.buildflow.finance.mapper.FinanceMapper;
import com.buildflow.finance.repository.ExpenseRepository;
import com.buildflow.finance.repository.ProjectBudgetRepository;
import com.buildflow.finance.service.BudgetService;
import com.buildflow.finance.validator.FinanceValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetServiceImpl implements BudgetService {

    private final ProjectBudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final FinanceMapper financeMapper;
    private final FinanceValidator financeValidator;

    @Override
    @Transactional
    public BudgetResponse initializeBudget(BudgetRequest request) {
        log.info("Initializing budget for project id: {}", request.getProjectId());
        
        if (budgetRepository.findByProjectId(request.getProjectId()).isPresent()) {
            throw new InvalidBudgetException("Budget already initialized for this project");
        }
        
        ProjectBudget budget = financeMapper.toEntity(request);
        budget.setActualExpenses(BigDecimal.ZERO);
        budget.setRemainingBudget(request.getEstimatedBudget());
        
        financeValidator.validateBudgetCalculation(budget);
        
        ProjectBudget savedBudget = budgetRepository.save(budget);
        return financeMapper.toResponse(savedBudget);
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetResponse getBudgetByProjectId(Long projectId) {
        ProjectBudget budget = budgetRepository.findByProjectId(projectId)
                .orElseThrow(() -> new InvalidBudgetException("Budget not found for project: " + projectId));
        return financeMapper.toResponse(budget);
    }

    @Override
    @Transactional
    public BudgetResponse updateBudget(Long projectId, BudgetRequest request) {
        log.info("Updating budget for project id: {}", projectId);
        
        ProjectBudget budget = budgetRepository.findByProjectId(projectId)
                .orElseThrow(() -> new InvalidBudgetException("Budget not found for project: " + projectId));
                
        budget.setEstimatedBudget(request.getEstimatedBudget());
        budget.setRemainingBudget(budget.getEstimatedBudget().subtract(budget.getActualExpenses()));
        
        financeValidator.validateBudgetCalculation(budget);
        
        ProjectBudget updatedBudget = budgetRepository.save(budget);
        return financeMapper.toResponse(updatedBudget);
    }

    @Override
    @Transactional
    public void updateActualExpenses(Long projectId) {
        log.info("Recalculating actual expenses for project id: {}", projectId);
        
        ProjectBudget budget = budgetRepository.findByProjectId(projectId).orElse(null);
        if (budget == null) {
            log.warn("Cannot update expenses for project {} as no budget is initialized", projectId);
            return;
        }
        
        List<Expense> expenses = expenseRepository.findByProjectId(projectId);
        BigDecimal totalExpenses = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        budget.setActualExpenses(totalExpenses);
        budget.setRemainingBudget(budget.getEstimatedBudget().subtract(totalExpenses));
        
        budgetRepository.save(budget);
    }
}
