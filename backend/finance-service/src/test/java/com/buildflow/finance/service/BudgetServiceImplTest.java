package com.buildflow.finance.service;

import com.buildflow.finance.dto.request.BudgetRequest;
import com.buildflow.finance.dto.response.BudgetResponse;
import com.buildflow.finance.entity.ProjectBudget;
import com.buildflow.finance.exception.InvalidBudgetException;
import com.buildflow.finance.mapper.FinanceMapper;
import com.buildflow.finance.repository.ExpenseRepository;
import com.buildflow.finance.repository.ProjectBudgetRepository;
import com.buildflow.finance.service.impl.BudgetServiceImpl;
import com.buildflow.finance.validator.FinanceValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceImplTest {

    @Mock
    private ProjectBudgetRepository budgetRepository;
    
    @Mock
    private ExpenseRepository expenseRepository;
    
    @Mock
    private FinanceMapper financeMapper;
    
    @Mock
    private FinanceValidator financeValidator;

    @InjectMocks
    private BudgetServiceImpl budgetService;

    private BudgetRequest request;
    private ProjectBudget budget;
    private BudgetResponse response;

    @BeforeEach
    void setUp() {
        request = new BudgetRequest();
        request.setProjectId(1L);
        request.setEstimatedBudget(new BigDecimal("10000.00"));

        budget = new ProjectBudget();
        budget.setId(1L);
        budget.setProjectId(1L);
        budget.setEstimatedBudget(new BigDecimal("10000.00"));
        budget.setActualExpenses(BigDecimal.ZERO);
        budget.setRemainingBudget(new BigDecimal("10000.00"));

        response = new BudgetResponse();
        response.setId(1L);
        response.setProjectId(1L);
        response.setEstimatedBudget(new BigDecimal("10000.00"));
        response.setRemainingBudget(new BigDecimal("10000.00"));
    }

    @Test
    void initializeBudget_ShouldSaveAndReturnResponse() {
        when(budgetRepository.findByProjectId(1L)).thenReturn(Optional.empty());
        when(financeMapper.toEntity(request)).thenReturn(budget);
        doNothing().when(financeValidator).validateBudgetCalculation(budget);
        when(budgetRepository.save(any(ProjectBudget.class))).thenReturn(budget);
        when(financeMapper.toResponse(budget)).thenReturn(response);

        BudgetResponse result = budgetService.initializeBudget(request);

        assertNotNull(result);
        assertEquals(new BigDecimal("10000.00"), result.getEstimatedBudget());
        verify(budgetRepository).save(any(ProjectBudget.class));
    }

    @Test
    void initializeBudget_ShouldThrowIfAlreadyExists() {
        when(budgetRepository.findByProjectId(1L)).thenReturn(Optional.of(budget));

        assertThrows(InvalidBudgetException.class, () -> budgetService.initializeBudget(request));
        verify(budgetRepository, never()).save(any(ProjectBudget.class));
    }
}
