package com.sms.repository;

import com.sms.entity.ExamSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamSubjectRepository extends JpaRepository<ExamSubject, Long> {
    List<ExamSubject> findByExamId(Long examId);
    Optional<ExamSubject> findByExamIdAndSubjectId(Long examId, Long subjectId);
    boolean existsByExamIdAndSubjectId(Long examId, Long subjectId);
}
