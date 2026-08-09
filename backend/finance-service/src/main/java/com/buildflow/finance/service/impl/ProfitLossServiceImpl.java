package com.buildflow.finance.service.impl;

import com.buildflow.finance.dto.response.ProfitLossResponse;
import com.buildflow.finance.entity.Expense;
import com.buildflow.finance.entity.Payment;
import com.buildflow.finance.entity.ProjectBudget;
import com.buildflow.finance.enums.PaymentStatus;
import com.buildflow.finance.repository.ExpenseRepository;
import com.buildflow.finance.repository.PaymentRepository;
import com.buildflow.finance.repository.ProjectBudgetRepository;
import com.buildflow.finance.service.ProfitLossService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfitLossServiceImpl implements ProfitLossService {

    private final ExpenseRepository expenseRepository;
    private final PaymentRepository paymentRepository;
    private final ProjectBudgetRepository budgetRepository;

    @Override
    @Transactional(readOnly = true)
    public ProfitLossResponse calculateProfitLoss(Long projectId) {
        log.info("Calculating profit/loss for project id: {}", projectId);
        
        // Get estimated budget if exists
        ProjectBudget budget = budgetRepository.findByProjectId(projectId).orElse(null);
        BigDecimal estimatedBudget = budget != null ? budget.getEstimatedBudget() : BigDecimal.ZERO;
        
        // Calculate total expenses
        List<Expense> expenses = expenseRepository.findByProjectId(projectId);
        BigDecimal totalExpenses = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        // Calculate total payments (only completed)
        List<Payment> payments = paymentRepository.findByProjectId(projectId);
        BigDecimal totalPayments = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        // Profit / Loss = Total Payments - Total Expenses
        BigDecimal netProfitOrLoss = totalPayments.subtract(totalExpenses);
        
        String status;
        if (netProfitOrLoss.compareTo(BigDecimal.ZERO) > 0) {
            status = "PROFIT";
        } else if (netProfitOrLoss.compareTo(BigDecimal.ZERO) < 0) {
            status = "LOSS";
        } else {
            status = "BREAK_EVEN";
        }
        
        return ProfitLossResponse.builder()
                .projectId(projectId)
                .totalEstimatedBudget(estimatedBudget)
                .totalExpenses(totalExpenses)
                .totalPaymentsReceived(totalPayments)
                .netProfitOrLoss(netProfitOrLoss)
                .status(status)
                .build();
    }
}
