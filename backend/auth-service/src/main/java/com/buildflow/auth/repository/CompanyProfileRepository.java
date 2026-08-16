package com.buildflow.auth.repository;

import com.buildflow.auth.entity.CompanyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, Long> {
}
