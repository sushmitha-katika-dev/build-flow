package com.buildflow.finance.service.impl;

import com.buildflow.finance.dto.request.ExpenseRequest;
import com.buildflow.finance.dto.request.ExpenseUpdateRequest;
import com.buildflow.finance.dto.response.ExpenseResponse;
import com.buildflow.finance.entity.Expense;
import com.buildflow.finance.exception.ExpenseNotFoundException;
import com.buildflow.finance.mapper.FinanceMapper;
import com.buildflow.finance.repository.ExpenseRepository;
import com.buildflow.finance.service.BudgetService;
import com.buildflow.finance.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final FinanceMapper financeMapper;
    private final BudgetService budgetService;

    @Override
    @Transactional
    public ExpenseResponse addExpense(ExpenseRequest request) {
        log.info("Adding expense for project id: {}", request.getProjectId());
        
        Expense expense = financeMapper.toEntity(request);
        Expense savedExpense = expenseRepository.save(expense);
        
        budgetService.updateActualExpenses(request.getProjectId());
        
        return financeMapper.toResponse(savedExpense);
    }

    @Override
    @Transactional
    public ExpenseResponse updateExpense(Long id, ExpenseUpdateRequest request) {
        log.info("Updating expense id: {}", id);
        
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ExpenseNotFoundException("Expense not found with id: " + id));
                
        financeMapper.updateEntityFromRequest(request, expense);
        Expense updatedExpense = expenseRepository.save(expense);
        
        budgetService.updateActualExpenses(updatedExpense.getProjectId());
        
        return financeMapper.toResponse(updatedExpense);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ExpenseNotFoundException("Expense not found with id: " + id));
        return financeMapper.toResponse(expense);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByProjectId(Long projectId) {
        return expenseRepository.findByProjectId(projectId).stream()
                .map(financeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteExpense(Long id) {
        log.info("Deleting expense id: {}", id);
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ExpenseNotFoundException("Expense not found with id: " + id));
        
        Long projectId = expense.getProjectId();
        expenseRepository.deleteById(id);
        
        budgetService.updateActualExpenses(projectId);
    }
}
