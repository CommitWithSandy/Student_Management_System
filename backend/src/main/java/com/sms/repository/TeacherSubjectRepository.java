package com.sms.repository;

import com.sms.entity.TeacherSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherSubjectRepository extends JpaRepository<TeacherSubject, Long> {
    List<TeacherSubject> findByTeacherId(Long teacherId);
    List<TeacherSubject> findByClassBatchId(Long classId);
    List<TeacherSubject> findBySubjectId(Long subjectId);
    Optional<TeacherSubject> findByTeacherIdAndSubjectIdAndClassBatchIdAndAcademicYear(Long teacherId, Long subjectId, Long classId, String academicYear);
    boolean existsByTeacherIdAndSubjectIdAndClassBatchId(Long teacherId, Long subjectId, Long classId);
}
