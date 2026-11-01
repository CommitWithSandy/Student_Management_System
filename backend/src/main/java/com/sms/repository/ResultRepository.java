package com.sms.repository;

import com.sms.entity.Result;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {
    List<Result> findByExamId(Long examId);
    List<Result> findByStudentId(Long studentId);
    Optional<Result> findByExamIdAndStudentId(Long examId, Long studentId);
    Page<Result> findByExamId(Long examId, Pageable pageable);
    List<Result> findByStudentIdAndIsPublishedTrue(Long studentId);
}
