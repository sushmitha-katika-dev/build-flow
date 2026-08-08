package com.buildflow.workforce.repository;

import com.buildflow.workforce.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByLabourId(Long labourId);
    List<Attendance> findByDate(LocalDate date);
}
