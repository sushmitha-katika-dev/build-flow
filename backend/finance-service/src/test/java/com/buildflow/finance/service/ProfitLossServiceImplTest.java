package com.buildflow.finance.service;

import com.buildflow.finance.dto.response.ProfitLossResponse;
import com.buildflow.finance.entity.Expense;
import com.buildflow.finance.entity.Payment;
import com.buildflow.finance.entity.ProjectBudget;
import com.buildflow.finance.enums.ExpenseCategory;
import com.buildflow.finance.enums.PaymentStatus;
import com.buildflow.finance.enums.PaymentType;
import com.buildflow.finance.repository.ExpenseRepository;
import com.buildflow.finance.repository.PaymentRepository;
import com.buildflow.finance.repository.ProjectBudgetRepository;
import com.buildflow.finance.service.impl.ProfitLossServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfitLossServiceImplTest {

    @Mock
    private ExpenseRepository expenseRepository;
    
    @Mock
    private PaymentRepository paymentRepository;
    
    @Mock
    private ProjectBudgetRepository budgetRepository;

    @InjectMocks
    private ProfitLossServiceImpl profitLossService;

    @Test
    void calculateProfitLoss_ShouldReturnProfit() {
        Long projectId = 1L;
        
        ProjectBudget budget = new ProjectBudget();
        budget.setEstimatedBudget(new BigDecimal("10000.00"));
        
        Expense expense = new Expense();
        expense.setAmount(new BigDecimal("2000.00"));
        expense.setCategory(ExpenseCategory.LABOUR);
        
        Payment payment = new Payment();
        payment.setAmount(new BigDecimal("5000.00"));
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setType(PaymentType.MILESTONE);
        
        when(budgetRepository.findByProjectId(projectId)).thenReturn(Optional.of(budget));
        when(expenseRepository.findByProjectId(projectId)).thenReturn(Arrays.asList(expense));
        when(paymentRepository.findByProjectId(projectId)).thenReturn(Arrays.asList(payment));

        ProfitLossResponse result = profitLossService.calculateProfitLoss(projectId);

        assertEquals(new BigDecimal("10000.00"), result.getTotalEstimatedBudget());
        assertEquals(new BigDecimal("2000.00"), result.getTotalExpenses());
        assertEquals(new BigDecimal("5000.00"), result.getTotalPaymentsReceived());
        assertEquals(new BigDecimal("3000.00"), result.getNetProfitOrLoss());
        assertEquals("PROFIT", result.getStatus());
    }
    
    @Test
    void calculateProfitLoss_ShouldReturnLoss() {
        Long projectId = 1L;
        
        Expense expense = new Expense();
        expense.setAmount(new BigDecimal("7000.00"));
        
        Payment payment = new Payment();
        payment.setAmount(new BigDecimal("5000.00"));
        payment.setStatus(PaymentStatus.COMPLETED);
        
        when(budgetRepository.findByProjectId(projectId)).thenReturn(Optional.empty());
        when(expenseRepository.findByProjectId(projectId)).thenReturn(Arrays.asList(expense));
        when(paymentRepository.findByProjectId(projectId)).thenReturn(Arrays.asList(payment));

        ProfitLossResponse result = profitLossService.calculateProfitLoss(projectId);

        assertEquals(new BigDecimal("7000.00"), result.getTotalExpenses());
        assertEquals(new BigDecimal("5000.00"), result.getTotalPaymentsReceived());
        assertEquals(new BigDecimal("-2000.00"), result.getNetProfitOrLoss());
        assertEquals("LOSS", result.getStatus());
    }
}
