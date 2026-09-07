package com.buildflow.reporting.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "dashboard_snapshots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSnapshot {
    
    @Id
    private Long id; // Typically just a single row with ID 1
    
    private Integer activeProjectsCount;
    private Integer workersCount;
    private BigDecimal materialInvestment;
    private Integer lowStockAlertsCount;
    private BigDecimal totalCompanyRevenue;
    private BigDecimal totalCompanyExpenses;
    
    @UpdateTimestamp
    private LocalDateTime lastUpdated;
}
