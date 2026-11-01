package com.sms.repository;

import com.sms.entity.StudentSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentSubjectRepository extends JpaRepository<StudentSubject, Long> {
    List<StudentSubject> findByStudentId(Long studentId);
    List<StudentSubject> findBySubjectId(Long subjectId);
    Optional<StudentSubject> findByStudentIdAndSubjectIdAndAcademicYear(Long studentId, Long subjectId, String academicYear);
    boolean existsByStudentIdAndSubjectId(Long studentId, Long subjectId);
}
