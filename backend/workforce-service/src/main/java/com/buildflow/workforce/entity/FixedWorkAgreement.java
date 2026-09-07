package com.buildflow.workforce.entity;

import com.buildflow.workforce.enums.FixedWorkStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fixed_work_agreements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FixedWorkAgreement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "labour_id", nullable = false)
    private Long labourId;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "agreed_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal agreedAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FixedWorkStatus status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
