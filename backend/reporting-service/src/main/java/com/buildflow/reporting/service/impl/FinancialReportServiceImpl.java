package com.buildflow.reporting.service.impl;

import com.buildflow.reporting.dto.response.FinancialReportResponse;
import com.buildflow.reporting.entity.FinancialSummary;
import com.buildflow.reporting.repository.FinancialSummaryRepository;
import com.buildflow.reporting.service.FinancialReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinancialReportServiceImpl implements FinancialReportService {

    private final FinancialSummaryRepository financialRepository;

    @Override
    public List<FinancialReportResponse> getFinancialSummaries() {
        return financialRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public FinancialReportResponse getFinancialSummary(Long projectId) {
        return financialRepository.findById(projectId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Financial summary not found"));
    }

    private FinancialReportResponse mapToResponse(FinancialSummary entity) {
        String status = "BREAK_EVEN";
        if (entity.getCurrentProfitOrLoss() != null) {
            if (entity.getCurrentProfitOrLoss().compareTo(BigDecimal.ZERO) > 0) status = "PROFIT";
            else if (entity.getCurrentProfitOrLoss().compareTo(BigDecimal.ZERO) < 0) status = "LOSS";
        }
        
        return FinancialReportResponse.builder()
                .projectId(entity.getProjectId())
                .totalExpenses(entity.getTotalExpenses())
                .totalPaymentsReceived(entity.getTotalPaymentsReceived())
                .currentProfitOrLoss(entity.getCurrentProfitOrLoss())
                .financialStatus(status)
                .generatedAt(LocalDateTime.now())
                .build();
    }
}
