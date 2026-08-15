package com.buildflow.reporting.kafka;

import com.buildflow.reporting.constants.ReportingConstants;
import com.buildflow.reporting.entity.DashboardSnapshot;
import com.buildflow.reporting.entity.FinancialSummary;
import com.buildflow.reporting.repository.DashboardSnapshotRepository;
import com.buildflow.reporting.repository.FinancialSummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinanceEventConsumer {

    private final FinancialSummaryRepository financialRepository;
    private final DashboardSnapshotRepository dashboardRepository;

    @KafkaListener(topics = ReportingConstants.FINANCE_EXPENSE_TOPIC, groupId = "reporting-group")
    public void consumeExpenseRecorded(Map<String, Object> event) {
        log.info("Consumed Finance Expense Event: {}", event);
        try {
            Long projectId = Long.valueOf(event.get("projectId").toString());
            BigDecimal amount = new BigDecimal(event.get("amount").toString());
            
            FinancialSummary summary = getOrCreateSummary(projectId);
            summary.setTotalExpenses(summary.getTotalExpenses().add(amount));
            summary.setCurrentProfitOrLoss(summary.getTotalPaymentsReceived().subtract(summary.getTotalExpenses()));
            
            financialRepository.save(summary);
            updateDashboardSnapshot();
        } catch (Exception e) {
            log.error("Error processing expense event", e);
        }
    }

    @KafkaListener(topics = ReportingConstants.FINANCE_PAYMENT_TOPIC, groupId = "reporting-group")
    public void consumePaymentReceived(Map<String, Object> event) {
        log.info("Consumed Finance Payment Event: {}", event);
        try {
            Long projectId = Long.valueOf(event.get("projectId").toString());
            BigDecimal amount = new BigDecimal(event.get("amount").toString());
            
            FinancialSummary summary = getOrCreateSummary(projectId);
            summary.setTotalPaymentsReceived(summary.getTotalPaymentsReceived().add(amount));
            summary.setCurrentProfitOrLoss(summary.getTotalPaymentsReceived().subtract(summary.getTotalExpenses()));
            
            financialRepository.save(summary);
            updateDashboardSnapshot();
        } catch (Exception e) {
            log.error("Error processing payment event", e);
        }
    }
    
    private FinancialSummary getOrCreateSummary(Long projectId) {
        return financialRepository.findById(projectId)
                .orElse(FinancialSummary.builder()
                        .projectId(projectId)
                        .totalExpenses(BigDecimal.ZERO)
                        .totalPaymentsReceived(BigDecimal.ZERO)
                        .currentProfitOrLoss(BigDecimal.ZERO)
                        .build());
    }
    
    private void updateDashboardSnapshot() {
        DashboardSnapshot snapshot = dashboardRepository.findById(1L).orElse(new DashboardSnapshot());
        snapshot.setId(1L);
        
        List<FinancialSummary> allSummaries = financialRepository.findAll();
        BigDecimal totalExpenses = allSummaries.stream().map(FinancialSummary::getTotalExpenses).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalRevenue = allSummaries.stream().map(FinancialSummary::getTotalPaymentsReceived).reduce(BigDecimal.ZERO, BigDecimal::add);
        
        snapshot.setTotalCompanyExpenses(totalExpenses);
        snapshot.setTotalCompanyRevenue(totalRevenue);
        
        dashboardRepository.save(snapshot);
    }
}
