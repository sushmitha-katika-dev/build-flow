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
@Table(name = "inventory_summaries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventorySummary {
    
    @Id
    private Long materialId;
    
    private String materialName;
    private Integer totalQuantityAvailable;
    private Integer lowStockThreshold;
    private Boolean isLowStock;
    
    @UpdateTimestamp
    private LocalDateTime lastUpdated;
}
