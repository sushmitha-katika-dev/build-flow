package com.buildflow.reporting.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "workforce_summaries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkforceSummary {
    
    @Id
    private Long projectId;
    
    private Integer totalWorkersAssigned;
    private Integer workersPresentToday;
    
    @UpdateTimestamp
    private LocalDateTime lastUpdated;
}
