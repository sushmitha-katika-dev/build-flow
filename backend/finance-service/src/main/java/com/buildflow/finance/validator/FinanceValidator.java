package com.buildflow.finance.validator;

import com.buildflow.finance.entity.ProjectBudget;
import com.buildflow.finance.exception.InvalidBudgetException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class FinanceValidator {

    public void validateBudgetCalculation(ProjectBudget budget) {
        if (budget.getEstimatedBudget().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidBudgetException("Estimated budget cannot be negative");
        }
        if (budget.getActualExpenses() != null && budget.getActualExpenses().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidBudgetException("Actual expenses cannot be negative");
        }
    }
}
