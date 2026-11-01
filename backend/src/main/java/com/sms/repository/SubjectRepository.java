package com.sms.repository;

import com.sms.entity.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findByCode(String code);
    boolean existsByCode(String code);
    List<Subject> findByCourseId(Long courseId);
    List<Subject> findByCourseIdAndSemester(Long courseId, Integer semester);

    @Query("SELECT s FROM Subject s WHERE (:courseId IS NULL OR s.course.id = :courseId) AND (:semester IS NULL OR s.semester = :semester) AND (:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Subject> searchSubjects(@Param("search") String search, @Param("courseId") Long courseId, @Param("semester") Integer semester, Pageable pageable);
}
