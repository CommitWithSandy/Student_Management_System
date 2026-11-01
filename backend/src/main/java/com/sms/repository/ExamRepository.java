package com.sms.repository;

import com.sms.entity.Exam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByCourseId(Long courseId);
    List<Exam> findByCourseIdAndSemester(Long courseId, Integer semester);
    List<Exam> findByIsPublished(Boolean isPublished);
    Page<Exam> findAllByOrderByStartDateDesc(Pageable pageable);
    long countByIsPublished(Boolean isPublished);
}
