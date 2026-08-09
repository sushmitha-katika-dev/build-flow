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
@Table(name = "project_summaries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectSummary {
    
    @Id
    private Long projectId;
    
    private String projectName;
    private String status;
    private BigDecimal estimatedBudget;
    
    @UpdateTimestamp
    private LocalDateTime lastUpdated;
}
