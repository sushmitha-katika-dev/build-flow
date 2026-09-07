package com.buildflow.finance.messaging;

import com.buildflow.finance.dto.request.ExpenseRequest;
import com.buildflow.finance.dto.request.ExpenseUpdateRequest;
import com.buildflow.finance.dto.request.PaymentRequest;
import com.buildflow.finance.entity.Expense;
import com.buildflow.finance.entity.Payment;
import com.buildflow.finance.enums.ExpenseCategory;
import com.buildflow.finance.enums.PaymentStatus;
import com.buildflow.finance.enums.PaymentType;
import com.buildflow.finance.event.AttendanceEvent;
import com.buildflow.finance.event.FixedWorkAgreementEvent;
import com.buildflow.finance.event.InventoryTransactionEvent;
import com.buildflow.finance.event.EquipmentUsageEvent;
import com.buildflow.finance.event.WageEvent;
import com.buildflow.finance.repository.ExpenseRepository;
import com.buildflow.finance.repository.PaymentRepository;
import com.buildflow.finance.service.BudgetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class WorkforceKafkaConsumer {

    private final ExpenseRepository expenseRepository;
    private final PaymentRepository paymentRepository;
    private final BudgetService budgetService;

    // --- ATTENDANCE EVENTS ---

    @KafkaListener(topics = "attendance-logged", groupId = "finance-service-group")
    @Transactional
    public void consumeAttendanceLogged(AttendanceEvent event) {
        log.info("Received Attendance Logged event: {}", event.getId());
        if (event.getProjectId() == null || event.getEarned() == null || event.getEarned().compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        String referenceId = "ATT-" + event.getId();
        if (expenseRepository.findByReferenceId(referenceId).isPresent()) {
            log.warn("Expense already exists for attendance: {}", referenceId);
            return;
        }

        Expense expense = Expense.builder()
                .projectId(event.getProjectId())
                .amount(event.getEarned())
                .category(ExpenseCategory.WORKFORCE)
                .date(event.getDate())
                .description("Labour cost for attendance: " + event.getId())
                .referenceId(referenceId)
                .build();

        expenseRepository.save(expense);
        budgetService.updateActualExpenses(event.getProjectId());
    }

    @KafkaListener(topics = "attendance-updated", groupId = "finance-service-group")
    @Transactional
    public void consumeAttendanceUpdated(AttendanceEvent event) {
        log.info("Received Attendance Updated event: {}", event.getId());
        String referenceId = "ATT-" + event.getId();
        Optional<Expense> existingExpense = expenseRepository.findByReferenceId(referenceId);

        if (event.getProjectId() == null || event.getEarned() == null || event.getEarned().compareTo(BigDecimal.ZERO) <= 0) {
            // Delete if it existed
            if (existingExpense.isPresent()) {
                Expense expense = existingExpense.get();
                Long oldProjectId = expense.getProjectId();
                expenseRepository.delete(expense);
                budgetService.updateActualExpenses(oldProjectId);
            }
            return;
        }

        if (existingExpense.isPresent()) {
            Expense expense = existingExpense.get();
            Long oldProjectId = expense.getProjectId();
            
            expense.setAmount(event.getEarned());
            expense.setProjectId(event.getProjectId());
            expense.setDate(event.getDate());
            expenseRepository.save(expense);

            budgetService.updateActualExpenses(oldProjectId);
            if (!oldProjectId.equals(event.getProjectId())) {
                budgetService.updateActualExpenses(event.getProjectId());
            }
        } else {
            // Create if missing
            consumeAttendanceLogged(event);
        }
    }

    @KafkaListener(topics = "attendance-deleted", groupId = "finance-service-group")
    @Transactional
    public void consumeAttendanceDeleted(AttendanceEvent event) {
        log.info("Received Attendance Deleted event: {}", event.getId());
        String referenceId = "ATT-" + event.getId();
        Optional<Expense> existingExpense = expenseRepository.findByReferenceId(referenceId);

        if (existingExpense.isPresent()) {
            Expense expense = existingExpense.get();
            Long projectId = expense.getProjectId();
            expenseRepository.delete(expense);
            budgetService.updateActualExpenses(projectId);
        }
    }

    // --- FIXED WORK AGREEMENT EVENTS ---

    @KafkaListener(topics = "fixed-work-agreement-created", groupId = "finance-service-group")
    @Transactional
    public void consumeFixedWorkAgreementCreated(FixedWorkAgreementEvent event) {
        log.info("Received Fixed Work Agreement Created event: {}", event.getId());
        if (event.getProjectId() == null || event.getAgreedAmount() == null || event.getAgreedAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        String referenceId = "FWA-" + event.getId();
        if (expenseRepository.findByReferenceId(referenceId).isPresent()) {
            return;
        }

        Expense expense = Expense.builder()
                .projectId(event.getProjectId())
                .amount(event.getAgreedAmount())
                .category(ExpenseCategory.WORKFORCE)
                .date(LocalDate.now())
                .description("Labour cost for fixed work agreement: " + event.getId())
                .referenceId(referenceId)
                .build();

        expenseRepository.save(expense);
        budgetService.updateActualExpenses(event.getProjectId());
    }

    @KafkaListener(topics = "fixed-work-agreement-updated", groupId = "finance-service-group")
    @Transactional
    public void consumeFixedWorkAgreementUpdated(FixedWorkAgreementEvent event) {
        log.info("Received Fixed Work Agreement Updated event: {}", event.getId());
        String referenceId = "FWA-" + event.getId();
        Optional<Expense> existingExpense = expenseRepository.findByReferenceId(referenceId);

        if (event.getProjectId() == null || event.getAgreedAmount() == null || event.getAgreedAmount().compareTo(BigDecimal.ZERO) <= 0) {
            if (existingExpense.isPresent()) {
                Expense expense = existingExpense.get();
                Long oldProjectId = expense.getProjectId();
                expenseRepository.delete(expense);
                budgetService.updateActualExpenses(oldProjectId);
            }
            return;
        }

        if (existingExpense.isPresent()) {
            Expense expense = existingExpense.get();
            Long oldProjectId = expense.getProjectId();
            
            expense.setAmount(event.getAgreedAmount());
            expense.setProjectId(event.getProjectId());
            expenseRepository.save(expense);

            budgetService.updateActualExpenses(oldProjectId);
            if (!oldProjectId.equals(event.getProjectId())) {
                budgetService.updateActualExpenses(event.getProjectId());
            }
        } else {
            consumeFixedWorkAgreementCreated(event);
        }
    }

    @KafkaListener(topics = "fixed-work-agreement-cancelled", groupId = "finance-service-group")
    @Transactional
    public void consumeFixedWorkAgreementCancelled(FixedWorkAgreementEvent event) {
        log.info("Received Fixed Work Agreement Cancelled event: {}", event.getId());
        String referenceId = "FWA-" + event.getId();
        String revReferenceId = referenceId + "-REV";
        
        Optional<Expense> existingExpense = expenseRepository.findByReferenceId(referenceId);
        Optional<Expense> existingRevExpense = expenseRepository.findByReferenceId(revReferenceId);

        if (existingExpense.isPresent() && existingRevExpense.isEmpty()) {
            Expense original = existingExpense.get();
            
            Expense reversal = Expense.builder()
                    .projectId(original.getProjectId())
                    .amount(original.getAmount().negate())
                    .category(ExpenseCategory.WORKFORCE)
                    .date(LocalDate.now())
                    .description("Reversal for cancelled fixed work agreement: " + event.getId())
                    .referenceId(revReferenceId)
                    .build();
            
            expenseRepository.save(reversal);
            budgetService.updateActualExpenses(original.getProjectId());
        }
    }

    // --- WAGE EVENTS ---

    @KafkaListener(topics = "wage-processed", groupId = "finance-service-group")
    @Transactional
    public void consumeWageProcessed(WageEvent event) {
        log.info("Received Wage Processed event: {}", event.getId());
        if (event.getProjectId() == null || event.getAmountPaid() == null || event.getAmountPaid().compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        String referenceId = "PAY-WAGE-" + event.getId();
        if (paymentRepository.findByReferenceId(referenceId).isPresent()) {
            return;
        }

        Payment payment = Payment.builder()
                .projectId(event.getProjectId())
                .amount(event.getAmountPaid())
                .type(PaymentType.LABOUR_WAGE)
                .status(PaymentStatus.COMPLETED)
                .paymentDate(event.getPaymentDate() != null ? event.getPaymentDate() : LocalDate.now())
                .description("Wage payment: " + event.getId())
                .referenceId(referenceId)
                .build();

        paymentRepository.save(payment);
        budgetService.updateAmountPaid(event.getProjectId());
    }

    @KafkaListener(topics = "wage-updated", groupId = "finance-service-group")
    @Transactional
    public void consumeWageUpdated(WageEvent event) {
        log.info("Received Wage Updated event: {}", event.getId());
        String referenceId = "PAY-WAGE-" + event.getId();
        Optional<Payment> existingPayment = paymentRepository.findByReferenceId(referenceId);

        if (event.getProjectId() == null || event.getAmountPaid() == null || event.getAmountPaid().compareTo(BigDecimal.ZERO) <= 0) {
            if (existingPayment.isPresent()) {
                Payment payment = existingPayment.get();
                Long oldProjectId = payment.getProjectId();
                paymentRepository.delete(payment);
                budgetService.updateAmountPaid(oldProjectId);
            }
            return;
        }

        if (existingPayment.isPresent()) {
            Payment payment = existingPayment.get();
            Long oldProjectId = payment.getProjectId();
            
            payment.setAmount(event.getAmountPaid());
            payment.setProjectId(event.getProjectId());
            if(event.getPaymentDate() != null) payment.setPaymentDate(event.getPaymentDate());
            paymentRepository.save(payment);

            budgetService.updateAmountPaid(oldProjectId);
            if (!oldProjectId.equals(event.getProjectId())) {
                budgetService.updateAmountPaid(event.getProjectId());
            }
        } else {
            consumeWageProcessed(event);
        }
    }

    @KafkaListener(topics = "wage-cancelled", groupId = "finance-service-group")
    @Transactional
    public void consumeWageCancelled(WageEvent event) {
        log.info("Received Wage Cancelled event: {}", event.getId());
        String referenceId = "PAY-WAGE-" + event.getId();
        Optional<Payment> existingPayment = paymentRepository.findByReferenceId(referenceId);

        if (existingPayment.isPresent()) {
            Payment payment = existingPayment.get();
            Long projectId = payment.getProjectId();
            paymentRepository.delete(payment);
            budgetService.updateAmountPaid(projectId);
        }
    }

    // --- INVENTORY EVENTS ---

    @KafkaListener(topics = "inventory-material-consumed", groupId = "finance-service-group")
    @Transactional
    public void consumeInventoryMaterialConsumed(InventoryTransactionEvent event) {
        log.info("Received Inventory Material Consumed event: {}", event.getId());
        if (event.getProjectId() == null || event.getTotalCost() == null || event.getTotalCost().compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        String referenceId = "INV-MAT-" + event.getId();
        if (expenseRepository.findByReferenceId(referenceId).isPresent()) {
            return;
        }

        Expense expense = Expense.builder()
                .projectId(event.getProjectId())
                .amount(event.getTotalCost())
                .category(ExpenseCategory.MATERIAL)
                .date(event.getTransactionDate() != null ? event.getTransactionDate().toLocalDate() : LocalDate.now())
                .description("Material cost for transaction: " + event.getId() + (event.getNotes() != null ? " - " + event.getNotes() : ""))
                .referenceId(referenceId)
                .build();

        expenseRepository.save(expense);
        budgetService.updateActualExpenses(event.getProjectId());
    }

    // --- EQUIPMENT EVENTS ---

    @KafkaListener(topics = "equipment-usage-logged", groupId = "finance-service-group")
    @Transactional
    public void consumeEquipmentUsageLogged(EquipmentUsageEvent event) {
        log.info("Received Equipment Usage Logged event: {}", event.getUsageRecordId());
        if (event.getProjectId() == null || event.getTotalCost() == null || event.getTotalCost().compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        String referenceId = "EQUIPMENT-USAGE-" + event.getUsageRecordId();
        if (expenseRepository.findByReferenceId(referenceId).isPresent()) {
            return;
        }

        Expense expense = Expense.builder()
                .projectId(event.getProjectId())
                .amount(event.getTotalCost())
                .category(ExpenseCategory.EQUIPMENT)
                .date(event.getUsageDate() != null ? event.getUsageDate() : LocalDate.now())
                .description("Equipment usage cost: " + event.getUnitsUsed() + " units @ " + event.getAppliedUnitRate())
                .referenceId(referenceId)
                .build();

        expenseRepository.save(expense);
        budgetService.updateActualExpenses(event.getProjectId());
    }
}
