package com.sms.repository;

import com.sms.entity.Assignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByClassBatchId(Long classId);
    List<Assignment> findByTeacherId(Long teacherId);
    Page<Assignment> findByClassBatchIdOrderByDeadlineDesc(Long classId, Pageable pageable);
    Page<Assignment> findByTeacherIdOrderByCreatedAtDesc(Long teacherId, Pageable pageable);
}
