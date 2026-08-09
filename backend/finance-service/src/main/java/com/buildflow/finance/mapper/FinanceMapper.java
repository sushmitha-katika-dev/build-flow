package com.buildflow.finance.mapper;

import com.buildflow.finance.dto.request.BudgetRequest;
import com.buildflow.finance.dto.request.ExpenseRequest;
import com.buildflow.finance.dto.request.ExpenseUpdateRequest;
import com.buildflow.finance.dto.request.PaymentRequest;
import com.buildflow.finance.dto.response.BudgetResponse;
import com.buildflow.finance.dto.response.ExpenseResponse;
import com.buildflow.finance.dto.response.PaymentResponse;
import com.buildflow.finance.entity.Expense;
import com.buildflow.finance.entity.Payment;
import com.buildflow.finance.entity.ProjectBudget;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface FinanceMapper {

    Expense toEntity(ExpenseRequest request);
    void updateEntityFromRequest(ExpenseUpdateRequest request, @MappingTarget Expense entity);
    ExpenseResponse toResponse(Expense entity);

    Payment toEntity(PaymentRequest request);
    void updateEntityFromRequest(PaymentRequest request, @MappingTarget Payment entity);
    PaymentResponse toResponse(Payment entity);

    ProjectBudget toEntity(BudgetRequest request);
    BudgetResponse toResponse(ProjectBudget entity);
}
