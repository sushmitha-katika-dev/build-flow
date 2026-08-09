package com.buildflow.finance.service;

import com.buildflow.finance.dto.response.ProfitLossResponse;

public interface ProfitLossService {
    ProfitLossResponse calculateProfitLoss(Long projectId);
}
