package com.sms.repository;

import com.sms.entity.FeeStructure;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {
    List<FeeStructure> findByCourseId(Long courseId);
    List<FeeStructure> findByCourseIdAndSemester(Long courseId, Integer semester);
    Page<FeeStructure> findAllByOrderByDueDateDesc(Pageable pageable);
}
