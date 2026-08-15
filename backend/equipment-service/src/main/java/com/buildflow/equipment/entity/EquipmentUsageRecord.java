package com.buildflow.equipment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment_usage_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentUsageRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "equipment_id", nullable = false)
    private Long equipmentId;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "usage_date", nullable = false)
    private LocalDate usageDate;

    @Column(name = "units_used", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitsUsed;

    @Column(name = "applied_unit_rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal appliedUnitRate;

    @Column(name = "total_cost", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalCost;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
