package com.buildflow.inventory.repository;

import com.buildflow.inventory.entity.Material;
import com.buildflow.inventory.enums.MaterialType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByType(MaterialType type);
    boolean existsByName(String name);
}
