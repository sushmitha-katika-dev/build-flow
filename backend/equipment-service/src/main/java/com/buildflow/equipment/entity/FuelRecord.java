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
@Table(name = "fuel_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FuelRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "equipment_id", nullable = false)
    private Long equipmentId;

    @Column(name = "project_id")
    private Long projectId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal quantityInLiters;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal totalCost;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
