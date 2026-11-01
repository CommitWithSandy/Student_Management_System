package com.sms.repository;

import com.sms.entity.ClassBatch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassBatchRepository extends JpaRepository<ClassBatch, Long> {
    List<ClassBatch> findByCourseId(Long courseId);
    List<ClassBatch> findByCourseIdAndSemester(Long courseId, Integer semester);
    List<ClassBatch> findByStatus(ClassBatch.ClassStatus status);

    @Query("SELECT cb FROM ClassBatch cb WHERE (:courseId IS NULL OR cb.course.id = :courseId) AND (:semester IS NULL OR cb.semester = :semester) AND (:academicYear IS NULL OR cb.academicYear = :academicYear)")
    Page<ClassBatch> filterClasses(@Param("courseId") Long courseId, @Param("semester") Integer semester, @Param("academicYear") String academicYear, Pageable pageable);
}
